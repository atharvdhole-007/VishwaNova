/**
 * PHARMACOGENOMIC DATABASE — EXPANDED
 * ─────────────────────────────────────────────────────────────────────────
 * Clinical knowledge base for gene-drug interactions
 * Based on CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines
 * 30+ drugs · 8 pharmacogenes · Full alternate medications
 */

const PHARMACOGENES = {
  CYP2D6: {
    chromosome: 'chr22', startPos: 42126611, endPos: 42136875,
    starAlleles: {
      '*1': { function: 'normal', activity: 1.0, description: 'Wild-type, normal function' },
      '*2': { function: 'normal', activity: 1.0, description: 'Normal function' },
      '*3': { function: 'non-functional', activity: 0.0, description: 'Frameshift mutation' },
      '*4': { function: 'non-functional', activity: 0.0, description: 'Splice site mutation' },
      '*5': { function: 'non-functional', activity: 0.0, description: 'Gene deletion' },
      '*6': { function: 'non-functional', activity: 0.0, description: 'Frameshift mutation' },
      '*9': { function: 'decreased', activity: 0.5, description: 'Reduced function' },
      '*10': { function: 'decreased', activity: 0.5, description: 'Reduced function' },
      '*17': { function: 'increased', activity: 1.5, description: 'Increased function' },
      '*41': { function: 'decreased', activity: 0.5, description: 'Reduced function' },
    },
    commonVariants: {
      'rs3892097': { pos: 42524947, ref: 'C', alt: 'T', starAllele: '*4', impact: 'HIGH' },
      'rs1065852': { pos: 42526694, ref: 'G', alt: 'A', starAllele: '*4', impact: 'HIGH' },
      'rs5030865': { pos: 42526694, ref: 'G', alt: 'A', starAllele: '*3', impact: 'HIGH' },
      'rs28371725': { pos: 42524947, ref: 'C', alt: 'T', starAllele: '*41', impact: 'MODERATE' },
    },
  },
  CYP2C19: {
    chromosome: 'chr10', startPos: 96521657, endPos: 96541812,
    starAlleles: {
      '*1': { function: 'normal', activity: 1.0, description: 'Wild-type' },
      '*2': { function: 'non-functional', activity: 0.0, description: 'Splicing defect' },
      '*3': { function: 'non-functional', activity: 0.0, description: 'Stop codon' },
      '*17': { function: 'increased', activity: 1.5, description: 'Increased function' },
    },
    commonVariants: {
      'rs4244285': { pos: 96521657, ref: 'C', alt: 'T', starAllele: '*2', impact: 'HIGH' },
      'rs4986893': { pos: 96541812, ref: 'G', alt: 'A', starAllele: '*3', impact: 'HIGH' },
      'rs12248560': { pos: 96522463, ref: 'C', alt: 'T', starAllele: '*17', impact: 'MODERATE' },
    },
  },
  CYP2C9: {
    chromosome: 'chr10', startPos: 96702047, endPos: 96741843,
    starAlleles: {
      '*1': { function: 'normal', activity: 1.0, description: 'Wild-type' },
      '*2': { function: 'decreased', activity: 0.5, description: 'Arg144Cys' },
      '*3': { function: 'decreased', activity: 0.25, description: 'Ile359Leu — markedly reduced' },
    },
    commonVariants: {
      'rs1799853': { pos: 96702047, ref: 'C', alt: 'T', starAllele: '*2', impact: 'MODERATE' },
      'rs1057910': { pos: 96741843, ref: 'A', alt: 'C', starAllele: '*3', impact: 'HIGH' },
    },
  },
  TPMT: {
    chromosome: 'chr6', startPos: 18131034, endPos: 18139789,
    starAlleles: {
      '*1': { function: 'normal', activity: 1.0, description: 'Normal enzyme activity' },
      '*2': { function: 'non-functional', activity: 0.0, description: 'Silent mutation' },
      '*3A': { function: 'non-functional', activity: 0.0, description: 'Two non-functional alleles' },
      '*3C': { function: 'non-functional', activity: 0.0, description: 'Non-functional' },
    },
    commonVariants: {
      'rs1800460': { pos: 18143955, ref: 'G', alt: 'A', starAllele: '*3A', impact: 'HIGH' },
      'rs1800462': { pos: 18130743, ref: 'G', alt: 'A', starAllele: '*2', impact: 'HIGH' },
      'rs1142345': { pos: 18130918, ref: 'A', alt: 'G', starAllele: '*3C', impact: 'HIGH' },
    },
  },
  DPYD: {
    chromosome: 'chr1', startPos: 97981343, endPos: 98386615,
    starAlleles: {
      '*1': { function: 'normal', activity: 1.0, description: 'Wild-type' },
      '*2A': { function: 'non-functional', activity: 0.0, description: 'Splice site variant — complete DPD deficiency' },
      '*13': { function: 'non-functional', activity: 0.0, description: 'Non-functional' },
    },
    commonVariants: {
      'rs3918290': { pos: 97981343, ref: 'C', alt: 'A', starAllele: '*2A', impact: 'HIGH' },
      'rs55886062': { pos: 98015339, ref: 'A', alt: 'C', starAllele: '*13', impact: 'HIGH' },
    },
  },
  SLCO1B1: {
    chromosome: 'chr12', startPos: 21331549, endPos: 21392730,
    starAlleles: {
      '*1': { function: 'normal', activity: 1.0, description: 'Wild-type normal transport' },
      '*5': { function: 'decreased', activity: 0.3, description: 'Reduced hepatic uptake — myopathy risk' },
      '*15': { function: 'decreased', activity: 0.3, description: 'Reduced function' },
    },
    commonVariants: {
      'rs4149056': { pos: 21331549, ref: 'T', alt: 'C', starAllele: '*5', impact: 'HIGH' },
    },
  },
  VKORC1: {
    chromosome: 'chr16', startPos: 31093557, endPos: 31096068,
    starAlleles: {
      '*1': { function: 'normal', activity: 1.0, description: 'Wild-type' },
      '*2': { function: 'decreased', activity: 0.5, description: 'Reduced VKORC1 expression — increased warfarin sensitivity' },
    },
    commonVariants: {
      'rs9923231': { pos: 31093557, ref: 'G', alt: 'A', starAllele: '*2', impact: 'HIGH' },
    },
  },
  UGT1A1: {
    chromosome: 'chr2', startPos: 234668879, endPos: 234681945,
    starAlleles: {
      '*1': { function: 'normal', activity: 1.0, description: 'Wild-type' },
      '*28': { function: 'decreased', activity: 0.3, description: 'Reduced glucuronidation — Gilbert syndrome' },
      '*6': { function: 'decreased', activity: 0.5, description: 'Reduced function' },
    },
    commonVariants: {
      'rs8175347': { pos: 234668879, ref: 'TA6', alt: 'TA7', starAllele: '*28', impact: 'HIGH' },
    },
  },
};

// ── CPIC DRUG GUIDELINES (30+ drugs) ──────────────────────────────────────────
const CPIC_GUIDELINES = {
  // ═══ ANALGESICS ═══
  CODEINE: {
    primaryGene: 'CYP2D6', category: 'Analgesic (Opioid)', evidenceLevel: 'A',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID codeine. CYP2D6 PM patients cannot convert codeine to morphine — risk of respiratory depression from parent compound accumulation.',
        alternatives: ['morphine (direct)', 'hydromorphone', 'oxycodone (non-CYP2D6)', 'acetaminophen', 'NSAIDs (ibuprofen)'],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduced analgesic effect likely. Start at 25-50% reduced dose, monitor closely. Consider alternatives.',
        alternatives: ['tramadol (with caution)', 'acetaminophen', 'ibuprofen'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate. Normal codeine-to-morphine conversion expected.',
        alternatives: [],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID codeine. Ultra-rapid conversion to morphine causes life-threatening toxicity, respiratory depression, and death (especially in children).',
        alternatives: ['morphine (lower dose, titrated)', 'acetaminophen', 'NSAIDs'],
      },
    },
  },
  TRAMADOL: {
    primaryGene: 'CYP2D6', category: 'Analgesic (Opioid)', evidenceLevel: 'A',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Ineffective', severity: 'moderate',
        recommendation: 'Reduced formation of active metabolite O-desmethyltramadol. Analgesic efficacy significantly decreased.',
        alternatives: ['morphine', 'hydromorphone', 'acetaminophen', 'NSAIDs'],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'moderate',
        recommendation: 'Reduced efficacy likely. Monitor pain control. Consider dose increase or alternative.',
        alternatives: ['acetaminophen + ibuprofen', 'morphine (low dose)'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID. Rapid conversion to active metabolite — risk of respiratory depression and seizures.',
        alternatives: ['morphine (titrated)', 'acetaminophen', 'NSAIDs'],
      },
    },
  },
  OXYCODONE: {
    primaryGene: 'CYP2D6', category: 'Analgesic (Opioid)', evidenceLevel: 'B',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'moderate',
        recommendation: 'Reduced formation of oxymorphone. May have decreased analgesic effect. Monitor and adjust.',
        alternatives: ['hydromorphone', 'morphine'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Increased oxymorphone formation. Use lower starting dose with careful titration.',
        alternatives: ['morphine (titrated)', 'acetaminophen'],
      },
    },
  },

  // ═══ ANTICOAGULANTS ═══
  WARFARIN: {
    primaryGene: 'CYP2C9', secondaryGene: 'VKORC1', category: 'Anticoagulant', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing with regular INR monitoring.',
        alternatives: [],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce initial dose by 25-50%. Increased bleeding risk. Weekly INR monitoring recommended.',
        alternatives: ['apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban'],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'Significantly reduced warfarin clearance. Start at 50-75% dose reduction. High bleeding risk. Consider DOAC alternatives.',
        alternatives: ['apixaban (Eliquis)', 'rivaroxaban (Xarelto)', 'dabigatran (Pradaxa)', 'edoxaban (Savaysa)'],
      },
    },
  },
  CLOPIDOGREL: {
    primaryGene: 'CYP2C19', category: 'Antiplatelet', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing. Normal antiplatelet response expected.',
        alternatives: [],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduced active metabolite formation. Increased risk of cardiovascular events. Switch to alternative P2Y12 inhibitor.',
        alternatives: ['ticagrelor (Brilinta)', 'prasugrel (Effient)'],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID. Near-complete loss of antiplatelet activity. Critically high risk of stent thrombosis and stroke.',
        alternatives: ['ticagrelor (Brilinta)', 'prasugrel (Effient)'],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Enhanced activation. Standard or reduced dose may suffice. Monitor for bleeding.',
        alternatives: [],
      },
    },
  },

  // ═══ ANTIDEPRESSANTS ═══
  AMITRIPTYLINE: {
    primaryGene: 'CYP2D6', category: 'Antidepressant (TCA)', evidenceLevel: 'A',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID or reduce dose by 50%. Risk of QT prolongation, sedation, and anticholinergic toxicity.',
        alternatives: ['sertraline', 'citalopram', 'bupropion'],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce dose by 25%. Monitor for side effects including sedation and dry mouth.',
        alternatives: ['nortriptyline (lower dose)', 'sertraline'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Ineffective', severity: 'moderate',
        recommendation: 'Rapid metabolism — subtherapeutic levels likely. Consider alternative antidepressant class.',
        alternatives: ['venlafaxine', 'duloxetine', 'bupropion'],
      },
    },
  },
  NORTRIPTYLINE: {
    primaryGene: 'CYP2D6', category: 'Antidepressant (TCA)', evidenceLevel: 'A',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'Reduce dose by 50%. Elevated plasma levels — cardiotoxicity risk.',
        alternatives: ['sertraline', 'escitalopram', 'bupropion'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Ineffective', severity: 'moderate',
        recommendation: 'Subtherapeutic levels. Increase dose or switch class.',
        alternatives: ['venlafaxine', 'bupropion'],
      },
    },
  },
  SERTRALINE: {
    primaryGene: 'CYP2C19', category: 'Antidepressant (SSRI)', evidenceLevel: 'A',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce starting dose by 50%. Increased serotonergic side effects.',
        alternatives: ['escitalopram (lower dose)', 'bupropion', 'mirtazapine'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Rapid Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'moderate',
        recommendation: 'May need higher dose for therapeutic effect. Monitor response.',
        alternatives: ['fluoxetine', 'paroxetine'],
      },
    },
  },
  ESCITALOPRAM: {
    primaryGene: 'CYP2C19', category: 'Antidepressant (SSRI)', evidenceLevel: 'A',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce dose by 50%. QT prolongation risk at higher concentrations.',
        alternatives: ['bupropion', 'mirtazapine', 'desvenlafaxine'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Ineffective', severity: 'moderate',
        recommendation: 'Subtherapeutic levels likely. Consider alternative SSRI or increase dose.',
        alternatives: ['fluoxetine', 'paroxetine', 'venlafaxine'],
      },
    },
  },
  FLUOXETINE: {
    primaryGene: 'CYP2D6', category: 'Antidepressant (SSRI)', evidenceLevel: 'B',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce dose. Fluoxetine and norfluoxetine accumulation risk.',
        alternatives: ['sertraline', 'bupropion', 'citalopram'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
    },
  },
  PAROXETINE: {
    primaryGene: 'CYP2D6', category: 'Antidepressant (SSRI)', evidenceLevel: 'A',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce starting dose by 50%. Non-linear pharmacokinetics amplify risk.',
        alternatives: ['sertraline', 'bupropion', 'mirtazapine'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Ineffective', severity: 'moderate',
        recommendation: 'Subtherapeutic levels expected. Select alternative.',
        alternatives: ['venlafaxine', 'duloxetine', 'bupropion'],
      },
    },
  },
  VENLAFAXINE: {
    primaryGene: 'CYP2D6', category: 'Antidepressant (SNRI)', evidenceLevel: 'B',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Elevated venlafaxine levels, reduced desvenlafaxine. Increased side effects. Reduce dose by 25-50%.',
        alternatives: ['desvenlafaxine (active metabolite — bypasses CYP2D6)', 'bupropion', 'mirtazapine'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
    },
  },

  // ═══ IMMUNOSUPPRESSANTS ═══
  AZATHIOPRINE: {
    primaryGene: 'TPMT', category: 'Immunosuppressant', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce dose to 30-50% of standard. Monitor CBC weekly for first 8 weeks.',
        alternatives: ['mycophenolate mofetil', 'leflunomide', 'methotrexate (with monitoring)'],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID or use 10% of standard dose MAX. Life-threatening myelosuppression (pancytopenia, sepsis).',
        alternatives: ['mycophenolate mofetil (CellCept)', 'leflunomide (Arava)', 'tacrolimus', 'cyclosporine'],
      },
    },
  },
  MERCAPTOPURINE: {
    primaryGene: 'TPMT', category: 'Immunosuppressant / Chemotherapy', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce dose to 30-50%. Monitor CBC weekly.',
        alternatives: ['methotrexate (with monitoring)'],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID or drastically reduce (≤10%). Fatal myelosuppression risk.',
        alternatives: ['methotrexate', 'mycophenolate'],
      },
    },
  },
  THIOGUANINE: {
    primaryGene: 'TPMT', category: 'Chemotherapy', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID. Fatal bone marrow suppression.',
        alternatives: ['alternative chemotherapy per oncologist'],
      },
    },
  },

  // ═══ CHEMOTHERAPY ═══
  FLUOROURACIL: {
    primaryGene: 'DPYD', category: 'Chemotherapy (Antimetabolite)', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce dose to 50% of standard. Monitor for mucositis, diarrhea, neutropenia.',
        alternatives: ['capecitabine (reduced dose)', 'raltitrexed'],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID completely. DPD deficiency causes FATAL toxicity (severe mucositis, neutropenic sepsis, death).',
        alternatives: ['raltitrexed', 'alternative chemotherapy per oncologist'],
      },
    },
  },
  CAPECITABINE: {
    primaryGene: 'DPYD', category: 'Chemotherapy (Prodrug of 5-FU)', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce dose by 50%. Same DPD pathway as fluorouracil.',
        alternatives: ['raltitrexed'],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID. Converted to 5-FU in vivo — same fatal toxicity risk as fluorouracil.',
        alternatives: ['raltitrexed', 'alternative regimen per oncologist'],
      },
    },
  },
  IRINOTECAN: {
    primaryGene: 'UGT1A1', category: 'Chemotherapy', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce dose by 30%. Impaired SN-38 glucuronidation — diarrhea and neutropenia risk.',
        alternatives: ['alternative chemotherapy per oncologist'],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID standard dose. Severe neutropenia and diarrhea. Use reduced dose with intensive monitoring.',
        alternatives: ['oxaliplatin-based regimens'],
      },
    },
  },

  // ═══ STATINS ═══
  SIMVASTATIN: {
    primaryGene: 'SLCO1B1', category: 'Statin (Lipid-Lowering)', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate. Do not exceed 80mg.',
        alternatives: [],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Do not exceed 20mg/day. Increased myopathy risk due to elevated systemic exposure.',
        alternatives: ['rosuvastatin', 'pravastatin', 'fluvastatin'],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'AVOID simvastatin. Very high risk of rhabdomyolysis. Use alternative statin.',
        alternatives: ['rosuvastatin (Crestor)', 'pravastatin (Pravachol)', 'fluvastatin (Lescol)'],
      },
    },
  },
  ATORVASTATIN: {
    primaryGene: 'SLCO1B1', category: 'Statin (Lipid-Lowering)', evidenceLevel: 'B',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Use lower dose. Moderate myopathy risk. Monitor CK levels.',
        alternatives: ['rosuvastatin', 'pravastatin', 'fluvastatin'],
      },
    },
  },
  ROSUVASTATIN: {
    primaryGene: 'SLCO1B1', category: 'Statin (Lipid-Lowering)', evidenceLevel: 'B',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate. Less CYP-dependent than simvastatin.',
        alternatives: [],
      },
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'moderate',
        recommendation: 'Use lower starting dose. Rosuvastatin partially impacted by SLCO1B1.',
        alternatives: ['pravastatin', 'fluvastatin'],
      },
    },
  },

  // ═══ PROTON PUMP INHIBITORS ═══
  OMEPRAZOLE: {
    primaryGene: 'CYP2C19', category: 'Proton Pump Inhibitor', evidenceLevel: 'B',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'moderate',
        recommendation: 'Reduce dose by 50%. Increased drug exposure — higher efficacy but greater side effect risk.',
        alternatives: ['rabeprazole (less CYP2C19 dependent)', 'pantoprazole'],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Ineffective', severity: 'moderate',
        recommendation: 'May need higher dose or more frequent dosing for adequate acid suppression.',
        alternatives: ['rabeprazole', 'esomeprazole (higher dose)'],
      },
    },
  },
  LANSOPRAZOLE: {
    primaryGene: 'CYP2C19', category: 'Proton Pump Inhibitor', evidenceLevel: 'B',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'moderate',
        recommendation: 'Reduce dose. Prolonged drug exposure.',
        alternatives: ['rabeprazole', 'pantoprazole'],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Ineffective', severity: 'moderate',
        recommendation: 'Likely subtherapeutic. Increase dose or switch.',
        alternatives: ['rabeprazole', 'pantoprazole'],
      },
    },
  },

  // ═══ ANTIFUNGALS ═══
  VORICONAZOLE: {
    primaryGene: 'CYP2C19', category: 'Antifungal (Azole)', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing with therapeutic drug monitoring.',
        alternatives: [],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'Reduce dose. 2-4x higher plasma levels — hepatotoxicity and visual disturbances.',
        alternatives: ['posaconazole', 'isavuconazole', 'fluconazole'],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Ineffective', severity: 'high',
        recommendation: 'Subtherapeutic levels likely. Treatment failure risk. Use alternative or increase dose with TDM.',
        alternatives: ['posaconazole', 'isavuconazole'],
      },
    },
  },

  // ═══ ANTICONVULSANTS ═══
  PHENYTOIN: {
    primaryGene: 'CYP2C9', category: 'Anticonvulsant', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing with therapeutic drug monitoring.',
        alternatives: [],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Reduce dose by 25%. Increased risk of ataxia, nystagmus, sedation.',
        alternatives: ['levetiracetam', 'lamotrigine', 'valproic acid'],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'Reduce dose by 50%. Zero-order kinetics amplify toxicity — ataxia, cardiac arrhythmias.',
        alternatives: ['levetiracetam (Keppra)', 'lamotrigine (Lamictal)', 'valproic acid'],
      },
    },
  },

  // ═══ ANTI-HIV ═══
  ABACAVIR: {
    primaryGene: 'HLA-B', category: 'Antiretroviral (NRTI)', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'HLA-B*57:01 negative. Standard dosing appropriate.',
        alternatives: [],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'critical',
        recommendation: 'HLA-B*57:01 POSITIVE — CONTRAINDICATED. Fatal hypersensitivity syndrome (fever, rash, organ failure).',
        alternatives: ['tenofovir disoproxil (TDF)', 'tenofovir alafenamide (TAF)', 'zidovudine'],
      },
    },
  },

  // ═══ CARDIOVASCULAR ═══
  METOPROLOL: {
    primaryGene: 'CYP2D6', category: 'Beta-Blocker', evidenceLevel: 'B',
    guidelines: {
      'Poor Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'high',
        recommendation: 'Increased metoprolol exposure. Risk of bradycardia and hypotension. Reduce dose by 50-75%.',
        alternatives: ['bisoprolol', 'atenolol (renally cleared)', 'carvedilol'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Ineffective', severity: 'moderate',
        recommendation: 'Subtherapeutic levels. Consider higher dose or beta-blocker not metabolized by CYP2D6.',
        alternatives: ['bisoprolol', 'atenolol', 'nebivolol'],
      },
    },
  },

  // ═══ ANESTHETICS ═══
  ONDANSETRON: {
    primaryGene: 'CYP2D6', category: 'Antiemetic (5-HT3 Antagonist)', evidenceLevel: 'B',
    guidelines: {
      'Ultra Rapid Metabolizer': {
        riskLabel: 'Ineffective', severity: 'high',
        recommendation: 'Reduced antiemetic efficacy due to rapid clearance. Use alternative.',
        alternatives: ['granisetron', 'palonosetron', 'dexamethasone'],
      },
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
    },
  },
  CELECOXIB: {
    primaryGene: 'CYP2C9', category: 'NSAID (COX-2 Inhibitor)', evidenceLevel: 'B',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing appropriate.',
        alternatives: [],
      },
      'Intermediate Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'moderate',
        recommendation: 'Reduce starting dose by 50%. Monitor for GI and cardiovascular effects.',
        alternatives: ['ibuprofen (lower dose)', 'naproxen', 'meloxicam'],
      },
      'Poor Metabolizer': {
        riskLabel: 'Toxic', severity: 'high',
        recommendation: 'Reduce dose by 75% or avoid. Significantly increased exposure and GI bleeding risk.',
        alternatives: ['ibuprofen', 'naproxen', 'acetaminophen'],
      },
    },
  },
  TACROLIMUS: {
    primaryGene: 'CYP3A5', category: 'Immunosuppressant (Calcineurin Inhibitor)', evidenceLevel: 'A',
    guidelines: {
      'Normal Metabolizer': {
        riskLabel: 'Adjust Dosage', severity: 'moderate',
        recommendation: 'CYP3A5 expressors require 1.5-2x standard dose to achieve therapeutic trough levels.',
        alternatives: [],
      },
      'Poor Metabolizer': {
        riskLabel: 'Safe', severity: 'none',
        recommendation: 'Standard dosing. CYP3A5 non-expressors achieve therapeutic levels at standard doses.',
        alternatives: [],
      },
    },
  },
};

// METABOLIZER PHENOTYPES
const PHENOTYPES = {
  'Poor Metabolizer': { abbreviation: 'PM', activityScore: 0.0, riskLevel: 'critical' },
  'Intermediate Metabolizer': { abbreviation: 'IM', activityScore: 0.5, riskLevel: 'high' },
  'Normal Metabolizer': { abbreviation: 'NM', activityScore: 1.0, riskLevel: 'none' },
  'Rapid Metabolizer': { abbreviation: 'RM', activityScore: 1.5, riskLevel: 'moderate' },
  'Ultra Rapid Metabolizer': { abbreviation: 'UM', activityScore: 2.0, riskLevel: 'moderate' },
  'Decreased Function': { abbreviation: 'DF', activityScore: 0.5, riskLevel: 'high' },
};

// DRUG CATEGORIES for search
const DRUG_CATEGORIES = {};
Object.entries(CPIC_GUIDELINES).forEach(([drug, info]) => {
  const cat = info.category || 'Other';
  if (!DRUG_CATEGORIES[cat]) DRUG_CATEGORIES[cat] = [];
  DRUG_CATEGORIES[cat].push(drug);
});

module.exports = {
  PHARMACOGENES,
  CPIC_GUIDELINES,
  PHENOTYPES,
  DRUG_CATEGORIES,
};
