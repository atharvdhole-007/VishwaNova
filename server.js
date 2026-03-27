require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

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
    if (res.status === 429) throw { status: 429, message: 'Gemini rate limit hit. Wait 60s or switch to Groq/OpenRouter.' };
    throw { status: res.status, message: data?.error?.message || 'Gemini error' };
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── GROQ handler ──────────────────────────────────────────────────────────────
async function callGroq(model, prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw { status: 500, message: 'GROQ_API_KEY not set in .env — get free key at console.groq.com' };

  const res = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) throw { status: 429, message: 'Groq rate limit hit. Wait 60s or switch to a different model.' };
    throw { status: res.status, message: data?.error?.message || 'Groq error' };
  }

  return data?.choices?.[0]?.message?.content || '';
}

// ── OPENROUTER handler ────────────────────────────────────────────────────────
async function callOpenRouter(model, prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw { status: 500, message: 'OPENROUTER_API_KEY not set in .env — get free key at openrouter.ai' };

  const res = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'https://pharmaguard.onrender.com',
      'X-Title': 'PharmaGuard',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) throw { status: 429, message: 'OpenRouter rate limit hit. Try a different model.' };
    throw { status: res.status, message: data?.error?.message || 'OpenRouter error' };
  }

  return data?.choices?.[0]?.message?.content || '';
}

// ── Main AI route ─────────────────────────────────────────────────────────────
app.post('/api/ai', async (req, res) => {
  const { provider = 'gemini', model, prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  if (!model)  return res.status(400).json({ error: 'Missing model' });

  console.log(`[AI] provider=${provider} model=${model} prompt_len=${prompt.length}`);

  try {
    let text = '';
    if      (provider === 'gemini')     text = await callGemini(model, prompt);
    else if (provider === 'groq')       text = await callGroq(model, prompt);
    else if (provider === 'openrouter') text = await callOpenRouter(model, prompt);
    else return res.status(400).json({ error: `Unknown provider: ${provider}` });

    console.log(`[AI] success response_len=${text.length}`);
    return res.json({ text });

  } catch (err) {
    console.error(`[AI Error] provider=${provider}`, err);
    return res.status(err.status || 500).json({ error: err.message || 'AI provider error' });
  }
});

// ── Legacy Gemini proxy (keep for backward compat) ────────────────────────────
app.post('/api/gemini', async (req, res) => {
  const { model = 'gemini-2.0-flash', contents, generationConfig } = req.body;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env' });
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
    providers: {
      gemini:     !!process.env.GEMINI_API_KEY,
      groq:       !!process.env.GROQ_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
    }
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
  console.log(`\n┌─────────────────────────────────────────────┐`);
  console.log(`│         PharmaGuard — RIFT 2026             │`);
  console.log(`├─────────────────────────────────────────────┤`);
  console.log(`│  URL:         http://localhost:${PORT}           │`);
  console.log(`│  Gemini:      ${g.padEnd(29)}│`);
  console.log(`│  Groq:        ${r.padEnd(29)}│`);
  console.log(`│  OpenRouter:  ${o.padEnd(29)}│`);
  console.log(`└─────────────────────────────────────────────┘\n`);
});