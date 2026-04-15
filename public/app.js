// ══════════════════════════════════════════════════════════════════════
// MediSecure v3 — Frontend Application Logic
// ══════════════════════════════════════════════════════════════════════

// ── PRELOADER & SCROLL REVEAL ──────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader').classList.add('fade-out'), 1200);
});
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── STATE ──────────────────────────────────────────────────────────────
let currentVCFContent = null;
let currentVCFName = null;
let selectedDrugs = new Map(); // name -> {source: 'CPIC'|'CUSTOM'}
let allDrugsList = [];
let lastResultJSON = null;

// ── LOAD DRUG DATABASE ─────────────────────────────────────────────────
async function loadDrugDatabase() {
  try {
    const res = await fetch('/api/drugs/list');
    const data = await res.json();
    allDrugsList = data.drugs || [];
    console.log(`[DB] Loaded ${allDrugsList.length} drugs from CPIC database`);
  } catch (e) {
    console.warn('[DB] Could not load drug list, using fallback');
    allDrugsList = [
      { name: 'CODEINE', category: 'Analgesic (Opioid)', primaryGene: 'CYP2D6' },
      { name: 'WARFARIN', category: 'Anticoagulant', primaryGene: 'CYP2C9' },
      { name: 'CLOPIDOGREL', category: 'Antiplatelet', primaryGene: 'CYP2C19' },
      { name: 'SIMVASTATIN', category: 'Statin', primaryGene: 'SLCO1B1' },
      { name: 'AZATHIOPRINE', category: 'Immunosuppressant', primaryGene: 'TPMT' },
      { name: 'FLUOROURACIL', category: 'Chemotherapy', primaryGene: 'DPYD' },
    ];
  }
}
loadDrugDatabase();

// ── SAMPLE VCF ─────────────────────────────────────────────────────────
function loadSampleVCF() {
  const lines = [
    '##fileformat=VCFv4.2',
    '##INFO=<ID=GENE,Number=1,Type=String,Description="Gene symbol">',
    '##INFO=<ID=STAR,Number=1,Type=String,Description="Star allele">',
    '##INFO=<ID=RS,Number=1,Type=String,Description="dbSNP rsID">',
    '##INFO=<ID=IMPACT,Number=1,Type=String,Description="Functional impact">',
    '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO',
    'chr22\t42526694\trs1065852\tG\tA\t.\tPASS\tGENE=CYP2D6;STAR=*4;RS=rs1065852;IMPACT=HIGH',
    'chr22\t42524947\trs3892097\tC\tT\t.\tPASS\tGENE=CYP2D6;STAR=*4;RS=rs3892097;IMPACT=HIGH',
    'chr10\t96521657\trs4244285\tC\tT\t.\tPASS\tGENE=CYP2C19;STAR=*2;RS=rs4244285;IMPACT=HIGH',
    'chr10\t96741843\trs1057910\tA\tC\t.\tPASS\tGENE=CYP2C9;STAR=*3;RS=rs1057910;IMPACT=HIGH',
    'chr6\t18143955\trs1800460\tG\tA\t.\tPASS\tGENE=TPMT;STAR=*3A;RS=rs1800460;IMPACT=HIGH',
  ];
  currentVCFContent = lines.join('\n');
  currentVCFName = 'sample_poor_metabolizer.vcf';
  showFileInfo(currentVCFName, currentVCFContent.length);
  document.getElementById('dropZone').classList.add('loaded');
  // Scroll to show the loaded file
  document.getElementById('fileInfo').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── FILE HANDLING ──────────────────────────────────────────────────────
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragging'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('dragging'); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); });
fileInput.addEventListener('change', e => { if (e.target.files[0]) processFile(e.target.files[0]); });

function processFile(file) {
  if (!file.name.endsWith('.vcf')) { showError('Invalid file format. Upload a .vcf file.'); return; }
  if (file.size > 5 * 1024 * 1024) { showError('File too large. Max 5 MB.'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    currentVCFContent = e.target.result;
    currentVCFName = file.name;
    showFileInfo(file.name, file.size);
    dropZone.classList.add('loaded');
    hideError();
  };
  reader.readAsText(file);
}

function showFileInfo(name, size) {
  document.getElementById('fileName').textContent = name;
  document.getElementById('fileSize').textContent = (size / 1024).toFixed(1) + ' KB';
  document.getElementById('fileInfo').classList.add('visible');
  renderVCFPreview(currentVCFContent);
  updateGenomicProfile(currentVCFContent);
}

// ── VCF PREVIEW ────────────────────────────────────────────────────────
function renderVCFPreview(vcf) {
  const panel = document.getElementById('vcfPreview');
  const metaEl = document.getElementById('vcfMeta');
  const tableEl = document.getElementById('vcfTableWrap');
  const countEl = document.getElementById('vcfVariantCount');

  if (!vcf) { panel.classList.remove('visible'); return; }

  const lines = vcf.split('\n').filter(l => l.trim());
  const metaLines = lines.filter(l => l.startsWith('##'));
  const headerLine = lines.find(l => l.startsWith('#CHROM'));
  const dataLines = lines.filter(l => !l.startsWith('#') && l.trim());

  // Extract metadata tags
  let metaHTML = '';
  const format = metaLines.find(l => l.includes('fileformat='));
  if (format) metaHTML += `<span class="vcf-meta-tag">${escapeHTML(format.replace('##', ''))}</span>`;
  const patientLine = metaLines.find(l => l.includes('patient_id='));
  if (patientLine) metaHTML += `<span class="vcf-meta-tag">${escapeHTML(patientLine.replace('##', ''))}</span>`;
  metaHTML += `<span class="vcf-meta-tag">${dataLines.length} data rows</span>`;
  metaHTML += `<span class="vcf-meta-tag">${metaLines.length} meta headers</span>`;

  // Count unique genes
  const genes = new Set();
  dataLines.forEach(line => {
    const m = line.match(/GENE=([^;]+)/);
    if (m) genes.add(m[1]);
  });
  if (genes.size > 0) metaHTML += `<span class="vcf-meta-tag">Genes: ${[...genes].join(', ')}</span>`;

  metaEl.innerHTML = metaHTML;

  // Build table
  if (!headerLine) {
    tableEl.innerHTML = '<div style="padding:1rem;font-size:.75rem;color:var(--text-muted)">No variants header found</div>';
    countEl.textContent = '0 variants';
  } else {
    const cols = headerLine.substring(1).split('\t');
    let tableHTML = '<table class="vcf-table"><thead><tr>';
    // Show essential columns + parsed INFO fields
    tableHTML += '<th>#</th><th>CHROM</th><th>POS</th><th>ID</th><th>REF</th><th>ALT</th><th>GENE</th><th>ALLELE</th><th>IMPACT</th>';
    tableHTML += '</tr></thead><tbody>';

    dataLines.forEach((line, idx) => {
      const f = line.split('\t');
      const chr = f[0] || '-';
      const pos = f[1] || '-';
      const id = f[2] || '.';
      const ref = f[3] || '-';
      const alt = f[4] || '-';
      const info = f[7] || '';

      // Parse INFO
      const geneMatch = info.match(/GENE=([^;]+)/);
      const starMatch = info.match(/STAR=([^;]+)/);
      const impactMatch = info.match(/IMPACT=([^;]+)/);
      const gene = geneMatch ? geneMatch[1] : '-';
      const star = starMatch ? starMatch[1] : '-';
      const impact = impactMatch ? impactMatch[1] : '-';
      const impactClass = impact === 'HIGH' ? 'impact-high' : impact === 'MODERATE' ? 'impact-moderate' : '';

      tableHTML += `<tr>
        <td style="color:var(--text-muted);font-size:.6rem">${idx + 1}</td>
        <td>${chr}</td>
        <td>${pos}</td>
        <td style="color:var(--accent-mid)">${id}</td>
        <td>${ref}</td>
        <td style="font-weight:700">${alt}</td>
        <td class="gene-tag">${gene}</td>
        <td><span class="allele-tag">${star}</span></td>
        <td class="${impactClass}">${impact}</td>
      </tr>`;
    });

    tableHTML += '</tbody></table>';
    tableEl.innerHTML = tableHTML;
    countEl.textContent = `${dataLines.length} variant${dataLines.length !== 1 ? 's' : ''}`;
  }

  panel.classList.add('visible', 'expanded');
}

// Toggle VCF preview
document.getElementById('vcfPreviewToggle').addEventListener('click', () => {
  document.getElementById('vcfPreview').classList.toggle('expanded');
});

// ── GENOMIC PROFILE UPDATE ─────────────────────────────────────────────
function updateGenomicProfile(vcf) {
  const emptyEl = document.getElementById('genomicEmpty');
  const filledEl = document.getElementById('genomicFilled');
  if (!vcf) { emptyEl.style.display = 'flex'; filledEl.style.display = 'none'; return; }

  const lines = vcf.split('\n').filter(l => l.trim());
  const dataLines = lines.filter(l => !l.startsWith('#') && l.trim());

  const genes = new Set();
  let highImpact = 0;
  let pharmaCount = 0;

  dataLines.forEach(line => {
    const gm = line.match(/GENE=([^;]+)/);
    const im = line.match(/IMPACT=([^;]+)/);
    if (gm) { genes.add(gm[1]); pharmaCount++; }
    if (im && im[1] === 'HIGH') highImpact++;
  });

  // Update stat numbers with animation
  animateNumber('gpTotalVariants', dataLines.length);
  animateNumber('gpPharmaVariants', pharmaCount);
  animateNumber('gpHighImpact', highImpact);
  animateNumber('gpGeneCount', genes.size);

  // Gene chips
  const geneChipsEl = document.getElementById('gpGeneChips');
  geneChipsEl.innerHTML = [...genes].map(g =>
    `<span class="gene-chip"><span class="gene-dot"></span>${g}</span>`
  ).join('');

  // Risk bar — based on HIGH impact ratio
  const riskPercent = dataLines.length > 0 ? Math.min(100, Math.round((highImpact / dataLines.length) * 150)) : 0;
  const riskFill = document.getElementById('gpRiskFill');
  riskFill.style.width = riskPercent + '%';
  riskFill.className = 'risk-bar-fill' + (riskPercent > 66 ? ' high' : riskPercent > 33 ? ' moderate' : '');

  emptyEl.style.display = 'none';
  filledEl.style.display = 'block';
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 800;
  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  if (diff === 0) { el.textContent = target; return; }
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(start + diff * ease);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── DRUG SEARCH ────────────────────────────────────────────────────────
const drugSearch = document.getElementById('drugSearch');
const drugDropdown = document.getElementById('drugDropdown');
const selectedDrugsEl = document.getElementById('selectedDrugs');

drugSearch.addEventListener('input', () => {
  const q = drugSearch.value.trim().toUpperCase();
  if (!q) { drugDropdown.classList.remove('open'); return; }

  const matches = allDrugsList.filter(d => d.name.includes(q) || (d.category || '').toUpperCase().includes(q));
  if (matches.length === 0) {
    drugDropdown.innerHTML = `<div class="drug-dropdown-item" data-custom="${q}"><span>➕ Add "<b>${escapeHTML(q)}</b>" (Gemini AI)</span><span class="cat" style="color:#7C3AED">AI ANALYSIS</span></div>`;
  } else {
    let html = matches.slice(0, 12).map(d =>
      `<div class="drug-dropdown-item" data-drug="${d.name}"><span><b>${d.name}</b></span><span class="cat">${d.category || ''} · ${d.primaryGene}</span></div>`
    ).join('');
    // Always show "add custom" option at bottom
    if (!matches.find(d => d.name === q)) {
      html += `<div class="drug-dropdown-item" data-custom="${q}"><span>➕ Add "<b>${escapeHTML(q)}</b>" (Gemini AI)</span><span class="cat" style="color:#7C3AED">AI ANALYSIS</span></div>`;
    }
    drugDropdown.innerHTML = html;
  }
  drugDropdown.classList.add('open');

  drugDropdown.querySelectorAll('.drug-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const name = item.dataset.drug || item.dataset.custom;
      const source = item.dataset.drug ? 'CPIC' : 'CUSTOM';
      addDrug(name, source);
      drugSearch.value = '';
      drugDropdown.classList.remove('open');
    });
  });
});

drugSearch.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const q = drugSearch.value.trim().toUpperCase();
    if (!q) return;
    const match = allDrugsList.find(d => d.name === q);
    addDrug(q, match ? 'CPIC' : 'CUSTOM');
    drugSearch.value = '';
    drugDropdown.classList.remove('open');
  }
});

document.addEventListener('click', e => {
  if (!e.target.closest('.drug-search-wrap')) drugDropdown.classList.remove('open');
});

function addDrug(name, source) {
  if (selectedDrugs.has(name)) return;
  selectedDrugs.set(name, { source });
  renderSelectedDrugs();
}

function removeDrug(name) {
  selectedDrugs.delete(name);
  renderSelectedDrugs();
}

function renderSelectedDrugs() {
  selectedDrugsEl.innerHTML = '';
  selectedDrugs.forEach((info, name) => {
    const chip = document.createElement('span');
    chip.className = `drug-chip ${info.source === 'CPIC' ? 'cpic' : 'custom'}`;
    chip.innerHTML = `${name} <span class="chip-src">${info.source === 'CPIC' ? 'CPIC' : 'AI'}</span> <span class="remove" onclick="removeDrug('${name}')">&times;</span>`;
    selectedDrugsEl.appendChild(chip);
  });
}

// ── QUICK SELECT BUTTONS ───────────────────────────────────────────────
document.querySelectorAll('.drug-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const drug = btn.dataset.drug;
    if (selectedDrugs.has(drug)) { removeDrug(drug); btn.classList.remove('selected'); }
    else { addDrug(drug, 'CPIC'); btn.classList.add('selected'); }
  });
});

// ── HELPERS ────────────────────────────────────────────────────────────
function showError(msg) { const b = document.getElementById('errorBox'); b.textContent = '⚠ ' + msg; b.classList.add('visible'); }
function hideError() { document.getElementById('errorBox').classList.remove('visible'); }
function escapeHTML(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

const PROVIDER_MODELS = {
  gemini: [{ value: 'gemini-2.0-flash', label: 'gemini-2.0-flash (Recommended)' }, { value: 'gemini-2.0-flash-lite', label: 'gemini-2.0-flash-lite' }, { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' }],
  groq: [{ value: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b' }, { value: 'llama-3.1-8b-instant', label: 'llama-3.1-8b' }, { value: 'mixtral-8x7b-32768', label: 'mixtral-8x7b' }],
  openrouter: [{ value: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B' }, { value: 'google/gemma-3-27b-it:free', label: 'Gemma 3 27B' }],
};
function updateModelOptions() {
  const p = document.getElementById('providerSelect').value;
  const s = document.getElementById('modelSelect');
  s.innerHTML = PROVIDER_MODELS[p].map(m => `<option value="${m.value}">${m.label}</option>`).join('');
}

// ── LOADING ANIMATION ──────────────────────────────────────────────────
async function animateSteps() {
  const ids = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7'];
  for (let i = 0; i < ids.length; i++) {
    const el = document.getElementById(ids[i]);
    if (!el) continue;
    await new Promise(r => setTimeout(r, 600));
    el.classList.add('active');
    if (i > 0) { const prev = document.getElementById(ids[i - 1]); if (prev) prev.classList.add('done'); }
  }
}

// ── ANALYSIS ───────────────────────────────────────────────────────────
async function runAnalysis() {
  hideError();
  if (!currentVCFContent) { showError('Upload a VCF file first.'); return; }
  const allDrugs = [...selectedDrugs.keys()];
  if (allDrugs.length === 0) { showError('Select at least one drug.'); return; }

  const btn = document.getElementById('analyzeBtn');
  btn.classList.add('loading'); btn.disabled = true;
  document.getElementById('resultsContainer').classList.remove('visible');

  const ls = document.getElementById('loadingSection');
  ls.style.display = 'grid';
  ls.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.querySelectorAll('.loading-step').forEach(el => el.className = 'loading-step');
  animateSteps();

  try {
    const provider = document.getElementById('providerSelect').value;
    const model = document.getElementById('modelSelect').value;

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vcfContent: currentVCFContent,
        drugs: allDrugs,
        useGeminiExplanation: true,
        model, provider,
      }),
    });

    const ct = response.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await response.text();
      if (text.trim().startsWith('<')) throw new Error('Backend server is not running!');
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);

    lastResultJSON = data;
    ls.style.display = 'none';
    renderResults(data);
  } catch (e) {
    showError(e.message);
    ls.style.display = 'none';
  }
  btn.classList.remove('loading'); btn.disabled = false;
}

// ── RENDER RESULTS ─────────────────────────────────────────────────────
function renderResults(data) {
  const results = data.analysisResults || [];
  const interactions = data.interactions || [];
  const container = document.getElementById('resultsContainer');
  const nav = document.getElementById('resultsTabsNav');
  const content = document.getElementById('resultsTabsContent');
  nav.innerHTML = ''; content.innerHTML = '';

  // Interaction warnings
  if (interactions.length > 0) {
    const warnDiv = document.createElement('div');
    warnDiv.style.cssText = 'grid-column:span 12;';
    warnDiv.innerHTML = interactions.map(w =>
      `<div class="interaction-warning"><span class="warn-icon">⚠️</span><div><strong>Drug Interaction:</strong> ${escapeHTML(w.message)}</div></div>`
    ).join('');
    content.appendChild(warnDiv);
  }

  results.forEach((r, i) => {
    const risk = r.riskLabel || 'Unknown';
    const conf = Math.round((r.confidence || 0) * 100);
    const riskClass = { 'Safe': 'safe', 'Adjust Dosage': 'adjust', 'Toxic': 'toxic', 'Ineffective': 'ineffective' }[risk] || 'unknown';
    const isGemini = r.source === 'GEMINI_FALLBACK';
    const srcBadge = isGemini
      ? '<span class="source-badge gemini">🤖 Gemini AI</span>'
      : `<span class="source-badge cpic">📋 CPIC Level ${r.evidenceLevel || 'A'}</span>`;

    // Tab
    const t = document.createElement('button');
    t.className = `drug-tab ${i === 0 ? 'active' : ''}`;
    t.dataset.tab = i; t.innerText = r.drug || 'Analysis';
    nav.appendChild(t);

    // Content
    const body = document.createElement('div');
    body.className = `tab-content ${i === 0 ? 'active' : ''}`;
    body.dataset.content = i;

    // Alternatives HTML
    let altHTML = '';
    if (r.alternatives && r.alternatives.length > 0 && risk !== 'Safe') {
      altHTML = `<div class="alternatives-section"><h4>🛡️ Safer Alternatives for This Patient</h4><div>${r.alternatives.map(a => `<span class="alt-drug">${escapeHTML(a)}</span>`).join('')}</div></div>`;
    }

    // Validation proof HTML
    let proofHTML = '';
    if (r.validationProof && r.validationProof.length > 0) {
      const icons = { validated: '✓', assumed: '?', ai_generated: '🤖', not_found: '✗', error: '!', partial: '~', detected: '◉' };
      proofHTML = `<div class="validation-proof"><h4>🔍 Validation Proof Chain</h4>${r.validationProof.map(p =>
        `<div class="proof-step"><span class="proof-icon ${p.status}">${icons[p.status] || '·'}</span><div><strong>${escapeHTML(p.step)}:</strong> ${escapeHTML(p.result)}</div></div>`
      ).join('')}</div>`;
    }

    // Variants table
    const variants = r.detectedVariants || [];
    let variantsHTML = '';
    if (variants.length > 0) {
      variantsHTML = `<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>rsID</th><th>Gene</th><th>Allele</th><th>Impact</th></tr></thead><tbody>${variants.map(v =>
        `<tr><td>${v.rsid || '-'}</td><td>${v.gene || '-'}</td><td style="font-weight:700;color:var(--accent-primary)">${v.starAllele || (v.ref + '/' + v.alt)}</td><td style="color:${v.impact === 'HIGH' ? 'var(--toxic)' : 'inherit'}">${v.impact || '-'}</td></tr>`
      ).join('')}</tbody></table></div>`;
    }

    // Explanation
    const explanation = r.clinicalExplanation || r.recommendation || '';
    const explClass = isGemini ? 'explanation-card gemini-source' : 'explanation-card';

    body.innerHTML = `
      <div style="margin-bottom:1rem">${srcBadge}</div>
      <div class="kpi-row">
        <div class="kpi-card"><span class="kpi-label">Risk Category</span><span class="kpi-value ${riskClass}">${risk}</span></div>
        <div class="kpi-card"><span class="kpi-label">Confidence</span><span class="kpi-value">${conf}%</span></div>
        <div class="kpi-card"><span class="kpi-label">Phenotype</span><span class="kpi-value" style="font-size:1.5rem">${r.phenotype || 'N/A'}</span></div>
        <div class="kpi-card"><span class="kpi-label">Gene · Diplotype</span><span class="kpi-value mono" style="font-size:1.5rem;color:var(--accent-primary)">${r.gene || '-'} ${r.diplotype || ''}</span></div>
      </div>
      ${altHTML}
      <div class="${explClass}">
        <h3>Clinical Interpretation</h3>
        <div style="white-space:pre-wrap">${formatExplanation(explanation)}</div>
        <span class="meta">Source: ${isGemini ? 'Gemini AI Fallback' : 'CPIC Rule-Based Engine'} · ${r.category || ''} · ${new Date().toLocaleTimeString()}</span>
      </div>
      ${proofHTML}
      ${variantsHTML}
    `;
    content.appendChild(body);
  });

  // JSON tab
  const jt = document.createElement('button');
  jt.className = 'drug-tab'; jt.dataset.tab = 'json'; jt.innerText = 'RAW JSON';
  nav.appendChild(jt);
  const jBody = document.createElement('div');
  jBody.className = 'tab-content'; jBody.dataset.content = 'json';
  jBody.innerHTML = `<div class="bento-card" style="padding:0;overflow:hidden"><div class="json-viewer">${escapeHTML(JSON.stringify(data, null, 2))}</div></div>`;
  content.appendChild(jBody);

  // Tab click handlers
  nav.querySelectorAll('.drug-tab').forEach(bt => {
    bt.addEventListener('click', () => {
      nav.querySelectorAll('.drug-tab').forEach(b => b.classList.remove('active'));
      content.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      bt.classList.add('active');
      content.querySelector(`[data-content="${bt.dataset.tab}"]`).classList.add('active');
    });
  });

  container.classList.add('visible');
  setTimeout(() => {
    container.querySelectorAll('.kpi-card,.explanation-card,.data-table-wrapper,.alternatives-section,.validation-proof').forEach((el, i) => {
      el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
      el.style.transition = `all 0.5s ease ${i * 0.08}s`;
      setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 50);
    });
  }, 50);
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatExplanation(text) {
  if (!text) return '';
  // Bold markdown headers
  return escapeHTML(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
    .replace(/\n/g, '<br>');
}
