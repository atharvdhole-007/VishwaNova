/**
 * VCF PARSER & VARIANT VALIDATOR
 * ─────────────────────────────────────────────────────────────────────────
 * Parses VCF format and validates variants against known pharmacogenes
 */

const { PHARMACOGENES } = require('./pharma-db');

class VCFParser {
  constructor(vcfContent) {
    this.vcfContent = vcfContent;
    this.variants = [];
    this.metadata = {};
    this.errors = [];
  }

  /**
   * Main parsing function
   */
  parse() {
    const lines = this.vcfContent.split('\n').filter(l => l.trim() && !l.startsWith('##'));
    
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#CHROM')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      this.errors.push('No VCF header found (looking for #CHROM line)');
      return { variants: [], errors: this.errors, quality: 0 };
    }

    // Parse header - IMPORTANT: split by actual tab character
    const headerLine = lines[headerIndex].substring(1).split('\t');
    const chrIdx = headerLine.indexOf('CHROM');
    const posIdx = headerLine.indexOf('POS');
    const refIdx = headerLine.indexOf('REF');
    const altIdx = headerLine.indexOf('ALT');
    const idIdx = headerLine.indexOf('ID');
    const infoIdx = headerLine.indexOf('INFO');

    if (chrIdx === -1 || infoIdx === -1) {
      this.errors.push(`VCF header parsing failed. Found columns: ${headerLine.join(', ')}`);
      return { variants: [], errors: this.errors, quality: 0 };
    }

    // Parse variants
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const fields = lines[i].split('\t');
      if (fields.length < 5) {
        this.errors.push(`Line ${i}: Not enough fields (${fields.length} < 5)`);
        continue;
      }

      const variant = {
        chromosome: fields[chrIdx]?.trim(),
        position: parseInt(fields[posIdx]),
        ref: fields[refIdx]?.trim(),
        alt: fields[altIdx]?.trim(),
        rsid: fields[idIdx]?.trim() !== '.' ? fields[idIdx]?.trim() : null,
        info: fields[infoIdx]?.trim() || '',
      };

      // Extract INFO fields
      const infoObj = this.parseINFO(variant.info);
      variant.gene = infoObj.GENE || null;
      variant.starAllele = infoObj.STAR || null;
      variant.impact = infoObj.IMPACT || 'UNKNOWN';

      // Validate against known pharmacogenes
      variant.isPharmacogene = !!variant.gene && !!PHARMACOGENES[variant.gene];
      variant.knownVariant = this.isKnownVariant(variant);
      variant.validationScore = variant.isPharmacogene ? 1.0 : 0.3;

      this.variants.push(variant);
    }

    return {
      variants: this.variants,
      errors: this.errors,
      quality: this.calculateQualityScore(),
    };
  }

  /**
   * Parse INFO field (simple parser)
   */
  parseINFO(infoStr) {
    const obj = {};
    if (!infoStr || infoStr === '.') return obj;
    
    infoStr.split(';').forEach(item => {
      const [key, value] = item.split('=');
      if (key) obj[key.trim()] = value || true;
    });
    return obj;
  }

  /**
   * Check if variant is in our pharmacogenomic database
   */
  isKnownVariant(variant) {
    if (!variant.gene || !PHARMACOGENES[variant.gene]) return false;

    const gene = PHARMACOGENES[variant.gene];
    const variants = gene.commonVariants;

    if (variant.rsid && variants[variant.rsid]) {
      const known = variants[variant.rsid];
      return known.ref === variant.ref && known.alt === variant.alt;
    }

    return false;
  }

  /**
   * Quality metrics
   */
  calculateQualityScore() {
    const total = this.variants.length;
    if (total === 0) return 0;

    const known = this.variants.filter(v => v.knownVariant).length;
    const pharmacogenes = this.variants.filter(v => v.isPharmacogene).length;

    // Score: 0-1 based on known pharmacogenes
    return (known / total) * 0.6 + (pharmacogenes / total) * 0.4;
  }

  /**
   * Get pharmacogenomic variants only
   */
  getPharmacogenomic() {
    return this.variants.filter(v => v.isPharmacogene);
  }

  /**
   * Get summary stats
   */
  getSummary() {
    return {
      totalVariants: this.variants.length,
      pharmacogenicVariants: this.variants.filter(v => v.isPharmacogene).length,
      knownVariants: this.variants.filter(v => v.knownVariant).length,
      qualityScore: this.calculateQualityScore(),
      parsingSuccess: this.errors.length === 0,
      errors: this.errors,
    };
  }
}

module.exports = VCFParser;
