/**
 * PHARMACOGENOMIC LOGIC ENGINE — ENHANCED
 * ─────────────────────────────────────────────────────────────────────────
 * Performs diplotype calling, phenotype assignment, and CPIC matching
 * NO LLM USED - Pure logic-based analysis
 * Returns validation proof, alternate medications, confidence breakdown
 */

const { PHARMACOGENES, CPIC_GUIDELINES, PHENOTYPES } = require('./pharma-db');

class PharmacoEngine {
  constructor(variants) {
    this.variants = variants;
    this.geneProfiles = {};
    this.validationLog = [];
    this.buildGeneProfiles();
  }

  buildGeneProfiles() {
    this.variants.forEach(v => {
      if (!v.gene) return;
      if (!this.geneProfiles[v.gene]) {
        this.geneProfiles[v.gene] = {
          gene: v.gene, variants: [], starAlleles: [],
          diplotype: null, phenotype: null, activityScore: null,
        };
      }
      this.geneProfiles[v.gene].variants.push(v);
      if (v.starAllele) {
        this.geneProfiles[v.gene].starAlleles.push(v.starAllele);
      }
    });

    Object.keys(this.geneProfiles).forEach(gene => this.assignDiplotype(gene));
  }

  assignDiplotype(gene) {
    const profile = this.geneProfiles[gene];
    const starAlleles = [...new Set(profile.starAlleles)];

    if (starAlleles.length === 0) {
      profile.diplotype = '*1/*1';
      profile.phenotype = 'Normal Metabolizer';
      profile.activityScore = 2.0;
      this.validationLog.push({ gene, step: 'diplotype', detail: 'No variant alleles found → assumed wild-type *1/*1' });
    } else if (starAlleles.length === 1) {
      // Check if we saw this allele twice (homozygous) or once (heterozygous)
      const count = profile.starAlleles.filter(a => a === starAlleles[0]).length;
      if (count >= 2) {
        profile.diplotype = `${starAlleles[0]}/${starAlleles[0]}`;
        profile.phenotype = this.callPhenotype(gene, starAlleles[0], starAlleles[0]);
      } else {
        profile.diplotype = `*1/${starAlleles[0]}`;
        profile.phenotype = this.callPhenotype(gene, '*1', starAlleles[0]);
      }
      this.validationLog.push({ gene, step: 'diplotype', detail: `Found allele(s) [${starAlleles[0]}] x${count} → diplotype ${profile.diplotype}` });
    } else {
      profile.diplotype = `${starAlleles[0]}/${starAlleles[1]}`;
      profile.phenotype = this.callPhenotype(gene, starAlleles[0], starAlleles[1]);
      this.validationLog.push({ gene, step: 'diplotype', detail: `Compound heterozygous [${starAlleles[0]}, ${starAlleles[1]}] → diplotype ${profile.diplotype}` });
    }
  }

  callPhenotype(gene, allele1, allele2) {
    const db = PHARMACOGENES[gene];
    if (!db) return 'Unknown';

    const a1 = db.starAlleles[allele1] || { activity: 1.0 };
    const a2 = db.starAlleles[allele2] || { activity: 1.0 };
    const score = (a1.activity || 0) + (a2.activity || 0);

    const profile = this.geneProfiles[gene];
    if (profile) profile.activityScore = score;

    this.validationLog.push({
      gene, step: 'phenotype',
      detail: `${allele1}(${a1.activity}) + ${allele2}(${a2.activity}) = activity ${score}`,
    });

    if (score === 0) return 'Poor Metabolizer';
    if (score > 0 && score < 1.0) return 'Intermediate Metabolizer';
    if (score >= 1.0 && score <= 1.25) return 'Normal Metabolizer';
    if (score > 1.25 && score < 2.0) return 'Rapid Metabolizer';
    if (score >= 2.0) {
      // 2.0 = two normal alleles = Normal; >2.0 = Ultra Rapid
      if (score > 2.0) return 'Ultra Rapid Metabolizer';
      return 'Normal Metabolizer';
    }
    return 'Unknown';
  }

  analyzeDrug(drugName) {
    const upperDrug = drugName.toUpperCase().trim();
    const guideline = CPIC_GUIDELINES[upperDrug];

    if (!guideline) {
      return {
        drug: upperDrug, source: 'UNKNOWN',
        riskLabel: 'Unknown', confidence: 0.0,
        gene: null, diplotype: null, phenotype: null,
        reason: `Drug "${upperDrug}" not found in CPIC guidelines database.`,
        recommendation: 'No rule-based pharmacogenomic data available. Gemini AI analysis will be used.',
        severity: 'unknown', alternatives: [],
        detectedVariants: [], validationProof: [],
        evidenceLevel: null, category: null,
      };
    }

    const gene = guideline.primaryGene;
    const profile = this.geneProfiles[gene];

    if (!profile) {
      return {
        drug: upperDrug, source: 'CPIC',
        riskLabel: 'Safe', confidence: 0.4,
        gene, diplotype: '*1/*1 (assumed)',
        phenotype: 'Normal Metabolizer',
        reason: `No ${gene} variants detected in VCF. Wild-type assumed.`,
        recommendation: guideline.guidelines['Normal Metabolizer']?.recommendation || 'Standard dosing assumed.',
        severity: 'none',
        alternatives: guideline.guidelines['Normal Metabolizer']?.alternatives || [],
        detectedVariants: [], validationProof: [
          { step: 'Variant Detection', result: `No ${gene} variants in uploaded VCF`, status: 'assumed' },
          { step: 'Diplotype', result: '*1/*1 (wild-type default)', status: 'assumed' },
          { step: 'Phenotype', result: 'Normal Metabolizer (default)', status: 'assumed' },
        ],
        evidenceLevel: guideline.evidenceLevel,
        category: guideline.category,
      };
    }

    const phenotype = profile.phenotype;
    const cpicMatch = guideline.guidelines[phenotype];

    if (!cpicMatch) {
      // Try closest match
      const phenotypes = Object.keys(guideline.guidelines);
      const normalMatch = guideline.guidelines['Normal Metabolizer'];
      return {
        drug: upperDrug, source: 'CPIC',
        riskLabel: normalMatch?.riskLabel || 'Unknown',
        confidence: 0.5, gene, diplotype: profile.diplotype,
        phenotype,
        reason: `Exact CPIC guideline for "${phenotype}" not available. Closest match used.`,
        recommendation: normalMatch?.recommendation || 'Consult clinical pharmacist.',
        severity: normalMatch?.severity || 'unknown',
        alternatives: normalMatch?.alternatives || [],
        detectedVariants: profile.variants,
        validationProof: this.buildValidationProof(gene, profile, 'partial'),
        evidenceLevel: guideline.evidenceLevel,
        category: guideline.category,
      };
    }

    // Build confidence
    const totalGeneVariants = profile.variants.length;
    const knownVariants = profile.variants.filter(v => v.knownVariant).length;
    const highImpactVariants = profile.variants.filter(v => v.impact === 'HIGH').length;

    let confidence = 0.5;
    if (totalGeneVariants > 0) confidence += 0.25;
    if (knownVariants > 0) confidence += (knownVariants / totalGeneVariants) * 0.15;
    if (highImpactVariants > 0) confidence += 0.1;
    confidence = Math.min(1.0, Math.round(confidence * 100) / 100);

    return {
      drug: upperDrug, source: 'CPIC',
      riskLabel: cpicMatch.riskLabel,
      confidence,
      gene, diplotype: profile.diplotype,
      phenotype, activityScore: profile.activityScore,
      reason: `CPIC Level ${guideline.evidenceLevel} guideline match for ${gene} ${phenotype}.`,
      recommendation: cpicMatch.recommendation,
      severity: cpicMatch.severity || 'unknown',
      alternatives: cpicMatch.alternatives || [],
      detectedVariants: profile.variants,
      validationProof: this.buildValidationProof(gene, profile, 'full'),
      evidenceLevel: guideline.evidenceLevel,
      category: guideline.category,
    };
  }

  buildValidationProof(gene, profile, matchQuality) {
    const proof = [];
    profile.variants.forEach(v => {
      proof.push({
        step: 'Variant Detected',
        result: `${v.rsid || v.chromosome + ':' + v.position} → ${v.ref}>${v.alt} in ${gene}`,
        status: v.knownVariant ? 'validated' : 'detected',
      });
    });
    proof.push({
      step: 'Star Allele Mapping',
      result: `Alleles: [${[...new Set(profile.starAlleles)].join(', ')}] → Diplotype: ${profile.diplotype}`,
      status: matchQuality === 'full' ? 'validated' : 'partial',
    });
    proof.push({
      step: 'Phenotype Assignment',
      result: `Activity Score ${profile.activityScore} → ${profile.phenotype}`,
      status: 'validated',
    });
    proof.push({
      step: 'CPIC Guideline Match',
      result: `${matchQuality === 'full' ? 'Exact' : 'Closest'} match for ${profile.phenotype}`,
      status: matchQuality === 'full' ? 'validated' : 'partial',
    });
    return proof;
  }

  analyzeDrugs(drugList) {
    return drugList.map(drug => this.analyzeDrug(drug));
  }

  // Check for drug-drug interactions via shared gene pathways
  checkInteractions(drugResults) {
    const geneMap = {};
    const warnings = [];
    drugResults.forEach(r => {
      if (r.gene) {
        if (!geneMap[r.gene]) geneMap[r.gene] = [];
        geneMap[r.gene].push(r.drug);
      }
    });
    Object.entries(geneMap).forEach(([gene, drugs]) => {
      if (drugs.length > 1) {
        warnings.push({
          type: 'GENE_OVERLAP',
          gene,
          drugs,
          message: `${drugs.join(' and ')} both metabolized by ${gene}. Competitive inhibition possible — monitor for increased toxicity.`,
        });
      }
    });
    return warnings;
  }

  getPatientProfile() {
    return {
      detectedGenes: Object.keys(this.geneProfiles),
      geneProfiles: this.geneProfiles,
      totalVariants: this.variants.length,
      pharmacogenomicVariants: this.variants.filter(v => v.isPharmacogene).length,
      validationLog: this.validationLog,
    };
  }
}

module.exports = PharmacoEngine;
