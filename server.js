require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const VCFParser = require('./vcf-parser');
const PharmacoEngine = require('./pharma-engine');
const { CPIC_GUIDELINES, DRUG_CATEGORIES } = require('./pharma-db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// ── Retry with exponential backoff ────────────────────────────────────────────
async function fetchWithRetry(url, options, maxRetries = 3) {
  const delays = [5000, 10000, 20000];
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429 && res.status !== 503) return res;
    if (attempt === maxRetries) return res;
    const wait = parseInt(res.headers.get('Retry-After') || 0) * 1000 || delays[attempt];
    console.log(`[Retry ${attempt+1}/${maxRetries}] status=${res.status} waiting ${wait/1000}s...`);
    await new Promise(r => setTimeout(r, wait));
  }
}

// ── GEMINI handler ────────────────────────────────────────────────────────────
async function callGemini(model, prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw { status: 500, message: 'GEMINI_API_KEY not set in .env' };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) throw { status: 429, message: 'Gemini rate limit hit. Wait 60s.' };
    throw { status: res.status, message: data?.error?.message || 'Gemini error' };
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── GROQ handler ──────────────────────────────────────────────────────────────
async function callGroq(model, prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw { status: 500, message: 'GROQ_API_KEY not set' };

  const res = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 4096 }),
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data?.error?.message || 'Groq error' };
  return data?.choices?.[0]?.message?.content || '';
}

// ── OPENROUTER handler ────────────────────────────────────────────────────────
async function callOpenRouter(model, prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw { status: 500, message: 'OPENROUTER_API_KEY not set' };

  const res = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'https://pharmaguard.onrender.com', 'X-Title': 'PharmaGuard',
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 4096 }),
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data?.error?.message || 'OpenRouter error' };
  return data?.choices?.[0]?.message?.content || '';
}

// ── Call any AI provider ──────────────────────────────────────────────────────
async function callAI(provider, model, prompt) {
  if (provider === 'gemini') return callGemini(model, prompt);
  if (provider === 'groq') return callGroq(model, prompt);
  if (provider === 'openrouter') return callOpenRouter(model, prompt);
  throw { status: 400, message: `Unknown provider: ${provider}` };
}

// ── DRUG SEARCH ENDPOINT ──────────────────────────────────────────────────────
app.get('/api/drugs/search', (req, res) => {
  const q = (req.query.q || '').toUpperCase().trim();
  if (!q) {
    // Return all drugs grouped by category
    const all = Object.entries(CPIC_GUIDELINES).map(([name, info]) => ({
      name, category: info.category, evidenceLevel: info.evidenceLevel,
      primaryGene: info.primaryGene, source: 'CPIC',
    }));
    return res.json({ drugs: all, categories: DRUG_CATEGORIES });
  }

  const matches = Object.entries(CPIC_GUIDELINES)
    .filter(([name, info]) => name.includes(q) || (info.category || '').toUpperCase().includes(q))
    .map(([name, info]) => ({
      name, category: info.category, evidenceLevel: info.evidenceLevel,
      primaryGene: info.primaryGene, source: 'CPIC',
    }));

  return res.json({ drugs: matches, query: q });
});

// ── DRUG LIST ENDPOINT ────────────────────────────────────────────────────────
app.get('/api/drugs/list', (_req, res) => {
  const drugs = Object.entries(CPIC_GUIDELINES).map(([name, info]) => ({
    name, category: info.category, evidenceLevel: info.evidenceLevel,
    primaryGene: info.primaryGene,
  }));
  res.json({ drugs, categories: DRUG_CATEGORIES, total: drugs.length });
});

// ── GEMINI FALLBACK for unknown drugs ─────────────────────────────────────────
async function geminiDrugFallback(drugName, patientProfile, model, provider) {
  const geneList = patientProfile.detectedGenes.join(', ') || 'none detected';
  const profiles = Object.entries(patientProfile.geneProfiles)
    .map(([g, p]) => `${g}: diplotype=${p.diplotype}, phenotype=${p.phenotype}, activity=${p.activityScore}`)
    .join('\n');

  const prompt = `You are a clinical pharmacogenomics expert. A patient has the following genetic profile:

DETECTED GENES: ${geneList}
GENE PROFILES:
${profiles || 'No pharmacogenomic variants detected in VCF.'}

The prescriber wants to check the drug: "${drugName}"

This drug is NOT in our CPIC guidelines database, so we need your expert analysis.

RESPOND IN EXACTLY THIS JSON FORMAT (no markdown, no code blocks, just raw JSON):
{
  "drug": "${drugName}",
  "riskLabel": "Safe" or "Adjust Dosage" or "Toxic" or "Ineffective" or "Unknown",
  "severity": "none" or "moderate" or "high" or "critical",
  "gene": "primary gene affected or null",
  "phenotype": "metabolizer status or null",
  "recommendation": "clinical recommendation in 2-3 sentences",
  "alternatives": ["alt drug 1", "alt drug 2"],
  "biologicalMechanism": "2-3 sentence explanation of HOW genetics affect this drug",
  "importantWarnings": "key safety warnings",
  "confidence": 0.3 to 0.7
}

RULES:
- Base your assessment on known pharmacogenomic literature
- If the drug has no known pharmacogenomic interactions, say riskLabel="Safe" with appropriate explanation
- Always suggest 2-3 alternative medications
- Include the biological mechanism of action
- Be conservative — when in doubt, recommend caution`;

  try {
    const raw = await callAI(provider || 'gemini', model, prompt);
    // Extract JSON from response
    let jsonStr = raw.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);
    return {
      drug: drugName.toUpperCase(),
      source: 'GEMINI_FALLBACK',
      riskLabel: parsed.riskLabel || 'Unknown',
      confidence: parsed.confidence || 0.4,
      gene: parsed.gene || null,
      diplotype: null,
      phenotype: parsed.phenotype || null,
      reason: `Drug not in CPIC database. Analysis provided by ${model} AI.`,
      recommendation: parsed.recommendation || 'Consult clinical pharmacist.',
      severity: parsed.severity || 'unknown',
      alternatives: parsed.alternatives || [],
      biologicalMechanism: parsed.biologicalMechanism || '',
      importantWarnings: parsed.importantWarnings || '',
      detectedVariants: [],
      validationProof: [
        { step: 'CPIC Lookup', result: `"${drugName}" not found in rule-based database`, status: 'not_found' },
        { step: 'Gemini Fallback', result: `AI analysis performed using ${model}`, status: 'ai_generated' },
      ],
      evidenceLevel: 'AI',
      category: 'AI-Analyzed',
    };
  } catch (e) {
    console.error(`[Gemini Fallback Error for ${drugName}]`, e.message);
    return {
      drug: drugName.toUpperCase(),
      source: 'GEMINI_FALLBACK_ERROR',
      riskLabel: 'Unknown',
      confidence: 0.1,
      gene: null, diplotype: null, phenotype: null,
      reason: `Gemini fallback failed: ${e.message}`,
      recommendation: 'Unable to analyze. Consult clinical pharmacist for guidance.',
      severity: 'unknown', alternatives: [],
      detectedVariants: [],
      validationProof: [
        { step: 'CPIC Lookup', result: `"${drugName}" not found`, status: 'not_found' },
        { step: 'Gemini Fallback', result: `Failed: ${e.message}`, status: 'error' },
      ],
      evidenceLevel: null, category: null,
    };
  }
}

// ── Enhanced Gemini clinical explanation ───────────────────────────────────────
async function getGeminiExplanation(result, model, provider) {
  const altList = (result.alternatives || []).join(', ') || 'none specified';

  const prompt = `You are a clinical pharmacogenomics specialist writing a report for a prescribing physician.

ANALYSIS DATA:
- Drug: ${result.drug}
- Risk: ${result.riskLabel} (severity: ${result.severity})
- Gene: ${result.gene || 'N/A'}
- Diplotype: ${result.diplotype || 'N/A'}
- Phenotype: ${result.phenotype || 'N/A'}
- Confidence: ${Math.round((result.confidence || 0) * 100)}%
- CPIC Recommendation: ${result.recommendation}
- Alternative Medications: ${altList}

Write a comprehensive clinical summary with these EXACT sections (use these headers):

**CLINICAL SIGNIFICANCE:**
Why this genetic result matters for this specific drug (2-3 sentences).

**BIOLOGICAL MECHANISM:**
How the gene variant affects drug metabolism at the molecular level (2-3 sentences).

**PRESCRIBER ACTION ITEMS:**
Numbered list of 3-4 specific actions the prescriber should take.

**ALTERNATIVE MEDICATIONS:**
For each alternative drug listed above, explain WHY it is safer for this patient's genotype (1 sentence each).

**IMPORTANT SAFETY WARNINGS:**
Any critical warnings, contraindications, or monitoring requirements (2-3 bullet points).

Keep language clinical but accessible. Be specific and actionable.`;

  try {
    return await callAI(provider || 'gemini', model, prompt);
  } catch (e) {
    console.error(`[Gemini Explanation Error for ${result.drug}]`, e.message);
    return result.recommendation;
  }
}

// ── MAIN PHARMACOGENOMIC ANALYSIS ENDPOINT ────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const {
    vcfContent, drugs = [],
    useGeminiExplanation = true,
    model = 'gemini-2.0-flash',
    provider = 'gemini',
  } = req.body;

  if (!vcfContent) return res.status(400).json({ error: 'Missing VCF content' });
  if (!Array.isArray(drugs) || drugs.length === 0) return res.status(400).json({ error: 'Missing or empty drugs array' });

  console.log(`[Analysis] VCF size=${vcfContent.length} drugs=[${drugs.join(',')}]`);

  try {
    // Step 1: Parse VCF
    const parser = new VCFParser(vcfContent);
    const parseResult = parser.parse();
    console.log(`[VCF] variants=${parseResult.variants.length} quality=${parseResult.quality.toFixed(2)}`);

    // Step 2: Run engine (CPIC rule-based)
    const engine = new PharmacoEngine(parseResult.variants);
    const cpicResults = engine.analyzeDrugs(drugs);
    const patientProfile = engine.getPatientProfile();

    // Step 3: Handle unknown drugs via Gemini fallback
    const finalResults = [];
    for (const result of cpicResults) {
      if (result.source === 'UNKNOWN') {
        console.log(`[Gemini Fallback] Drug "${result.drug}" not in CPIC → querying AI...`);
        const aiResult = await geminiDrugFallback(result.drug, patientProfile, model, provider);
        finalResults.push(aiResult);
      } else {
        finalResults.push(result);
      }
    }

    // Step 4: Enrich ALL results with Gemini explanations
    if (useGeminiExplanation && process.env.GEMINI_API_KEY) {
      console.log(`[Gemini] Generating clinical explanations for ${finalResults.length} drugs...`);
      for (const result of finalResults) {
        try {
          result.clinicalExplanation = await getGeminiExplanation(result, model, provider);
        } catch (e) {
          result.clinicalExplanation = result.recommendation;
        }
      }
    }

    // Step 5: Check drug-drug interactions
    const interactions = engine.checkInteractions(finalResults);

    // Output
    const output = {
      timestamp: new Date().toISOString(),
      patientId: `PT_${Date.now()}`,
      analysisResults: finalResults,
      interactions,
      patientProfile,
      vcfQuality: {
        parsingSuccess: parseResult.quality > 0.5,
        qualityScore: parseResult.quality,
        totalVariants: parseResult.variants.length,
        pharmacogenomicVariants: parseResult.variants.filter(v => v.isPharmacogene).length,
        knownVariants: parseResult.variants.filter(v => v.knownVariant).length,
      },
      engine: 'MediSecure v3 (CPIC + Gemini Hybrid Engine)',
    };

    console.log(`[Success] ${finalResults.length} drug assessments, ${interactions.length} interactions`);
    return res.json(output);

  } catch (err) {
    console.error(`[Analysis Error]`, err);
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// ── Generic AI route ──────────────────────────────────────────────────────────
app.post('/api/ai', async (req, res) => {
  const { provider = 'gemini', model, prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  if (!model) return res.status(400).json({ error: 'Missing model' });

  try {
    const text = await callAI(provider, model, prompt);
    return res.json({ text });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'AI error' });
  }
});

// ── Legacy Gemini route ───────────────────────────────────────────────────────
app.post('/api/gemini', async (req, res) => {
  const { model = 'gemini-2.0-flash', contents, generationConfig } = req.body;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  if (!contents) return res.status(400).json({ error: 'Missing contents' });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  try {
    const gemRes = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: generationConfig || { temperature: 0.1, maxOutputTokens: 4096 } }),
    });
    const data = await gemRes.json();
    if (!gemRes.ok) return res.status(gemRes.status).json({ error: data?.error?.message || 'Gemini error' });
    return res.json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: 'v3.0',
    drugsInDatabase: Object.keys(CPIC_GUIDELINES).length,
    providers: {
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
    },
  });
});

// ── Static + catch-all ────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const g = process.env.GEMINI_API_KEY     ? '✓' : '✗ (add GEMINI_API_KEY)';
  const r = process.env.GROQ_API_KEY       ? '✓' : '✗ (add GROQ_API_KEY)';
  const o = process.env.OPENROUTER_API_KEY ? '✓' : '✗ (add OPENROUTER_API_KEY)';
  const d = Object.keys(CPIC_GUIDELINES).length;
  console.log(`\n┌─────────────────────────────────────────────┐`);
  console.log(`│     MediSecure v3 — VishwaNova 2026         │`);
  console.log(`├─────────────────────────────────────────────┤`);
  console.log(`│  URL:         http://localhost:${PORT}           │`);
  console.log(`│  Drugs in DB: ${String(d).padEnd(29)}│`);
  console.log(`│  Gemini:      ${g.padEnd(29)}│`);
  console.log(`│  Groq:        ${r.padEnd(29)}│`);
  console.log(`│  OpenRouter:  ${o.padEnd(29)}│`);
  console.log(`└─────────────────────────────────────────────┘\n`);
});