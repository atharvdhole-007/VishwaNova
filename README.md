# 💔 PharmaGuard — Because Some Families Don't Get a Second Chance

> *"She took the pill the doctor prescribed. Three hours later, she was gone."*  
> *— This is why we built PharmaGuard.*

---

## The Story Behind This Project

Meet **Aanya**.

She was 34. A mother of two. Bright eyes, loud laugh, the kind of person who remembered everyone's birthday.

Her doctor prescribed codeine after a minor surgery. Standard stuff. Completely routine.

What the doctor didn't know — what *no one* knew — was that Aanya's DNA carried a silent mutation in a gene called **CYP2D6**. It made her a **Poor Metabolizer**. Her body couldn't process codeine the normal way. Instead of pain relief, her body converted it all — too fast, too much — into a lethal dose of morphine.

She never woke up.

**Her death was 100% preventable.**

A simple genetic test. A 5-minute check. That's all it would have taken.

We couldn't save Aanya. But we built **PharmaGuard** so that no one else has to lose someone they love to a prescription that should have been safe.

---

## 🧬 What is PharmaGuard?

**PharmaGuard** is an AI-powered pharmacogenomic risk prediction tool.

You upload a patient's genetic file (VCF format). You enter a drug name. We tell you — within seconds — whether that drug is **safe**, **dangerous**, or **deadly** for that specific person.

Simple. Fast. Life-saving.

> *100,000+ Americans die every year from adverse drug reactions. Most of them had no idea their genes put them at risk.*

---

## 🌐 Try It Now

**[👉 Launch PharmaGuard](https://pharmaai-a61p.onrender.com/)**

No signup. No credit card. Just upload and know.

---

## 🎥 See It In Action

**[Watch the 2-minute demo →](https://drive.google.com/drive/folders/1TOGzCKPRR-EQTYQkWmTQUKRcwUT8OBer)**

---

## How It Works (In Plain English)

```
1. You upload a patient's genetic file  →  We read their DNA variants
2. You type a drug name                →  We check it against their genes
3. We use AI (Google Gemini)          →  To explain the risk in human language
4. You get a clear answer             →  Safe ✅  Adjust dose ⚠️  Avoid ❌
```

That's it. No medical degree required to understand the output.

---

## What You'll See

After analysis, PharmaGuard gives you:

**A clear risk label** — Safe, Caution, or Toxic/Contraindicated

**The science behind it** — which gene, which mutation, why it matters

**A plain-English explanation** — written by AI, readable by anyone

**Alternative drugs** — if the original drug is unsafe

**A link to official CPIC guidelines** — so doctors can verify everything

---

## Real Output Example

```
P{ "patient_id": "PATIENT_XXX", 
"drug": "DRUG_NAME", 
"timestamp": "ISO8601_timestamp", 
"risk_assessment": { "risk_label": "Safe|Adjust Dosage|Toxic|...", 
"confidence_score": 0.0, "severity": "none|low|moderate|high|critical" }, 
"pharmacogenomic_profile": { "primary_gene": "GENE_SYMBOL", 
"diplotype": "*X/*Y", "phenotype": "PM|IM|NM|RM|URM|Unknown", 
"detected_variants": [ { "rsid": "rsXXXX", ... } ] }, 
"clinical_recommendation": { ... }, 
"llm_generated_explanation": { "summary": "...", ... }, 
"quality_metrics": { "vcf_parsing_success": true, ... } 
}
```

---

## 🚀 Run It Yourself

```bash
git clone https://github.com/YOUR_USERNAME/pharmaguard.git
cd pharmaguard
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm start
# Open http://localhost:3001
```

---

## Deploy in 3 Clicks (Render.com)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect your repo
3. Add one environment variable: `GEMINI_API_KEY=your_key_here`
4. Click Deploy

Live in minutes. Costs nothing on the free tier.

---

## 🧪 Test Files Included

We included 3 sample patient files so you can see PharmaGuard in action immediately:

| File | What it shows |
|------|---------------|
| `patient_high_risk.vcf` | A patient like Aanya — dangerous drug interaction |
| `patient_normal.vcf` | A patient with no genetic risks — safe to proceed |
| `patient_intermediate.vcf` | A patient who needs dose adjustments |

---

## 🏗 Tech Stack

| What | How |
|------|-----|
| Frontend | Vanilla HTML/CSS/JS — no bloat, just fast |
| Backend | Node.js + Express |
| AI Engine | LLM |
| Standards | CPIC Guidelines (the gold standard in pharmacogenomics) |
| Hosting | Render.com — free, fast, reliable |

---

## 👥CoderX Team

Built with love, urgency, and a lot of late nights at **RIFT 2026 Hackathon — HealthTech Track**.

- **[Ankur Ojha]** — [Leader]
- **[Vedant Mahore]** 
- **[Harshal Vidhate]** 

---

## One Last Thing

Somewhere out there, there's another Aanya.

She's about to be handed a prescription. Her doctor means well. The pharmacy will fill it without question. And no one — no one — will think to check her genes.

**PharmaGuard exists for her.**

If this project saves even one life, every sleepless night building it was worth it.

---

> ⚠️ *For research and educational purposes only. Not for clinical use without physician review.*  
> *RIFT 2026 · HealthTech Track · PS2 Precision Medicine*

---

*"The right drug for the right patient at the right dose."*  
*— That's not a slogan. That's a promise we're trying to keep.*  💙
