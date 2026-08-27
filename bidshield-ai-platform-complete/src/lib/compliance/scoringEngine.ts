import { RequirementEvaluation, ScoringWeightsConfig } from '@/types';
import { platformStore } from '@/lib/data/platformDataStore';

export class ComplianceScoringEngine {
  /**
   * Computes the deterministic compliance score (0-100) using current Admin weights.
   */
  calculateScore(evaluations: RequirementEvaluation[], customWeights?: ScoringWeightsConfig): number {
    const weights = customWeights || platformStore.getScoringWeights();

    let totalWeight = 0;
    let earnedScore = 0;

    for (const item of evaluations) {
      let weight = item.weight;

      // Map rule code to current dynamic admin weights
      if (item.ruleCode.includes('LC') || item.ruleCode.includes('MII')) {
        weight = weights.localContent;
      } else if (item.ruleCode.includes('GST')) {
        weight = weights.gst;
      } else if (item.ruleCode.includes('PAN')) {
        weight = weights.pan;
      } else if (item.ruleCode.includes('UDYAM')) {
        weight = weights.udyam;
      } else if (item.ruleCode.includes('ITR') || item.ruleCode.includes('TAX')) {
        weight = weights.tax;
      } else if (item.ruleCode.includes('OEM')) {
        weight = weights.oem;
      } else if (item.ruleCode.includes('DOCS')) {
        weight = weights.documents;
      } else if (item.ruleCode.includes('DEBAR')) {
        weight = weights.debarment;
      }

      totalWeight += weight;

      if (item.status === 'PASS') {
        earnedScore += weight;
      } else if (item.status === 'REVIEW') {
        earnedScore += weight * 0.5; // Partial credit for review items
      } else if (item.status === 'NOT_APPLICABLE') {
        earnedScore += weight; // Full credit if not applicable (e.g. MSME not claimed)
      }
    }

    if (totalWeight === 0) return 0;
    const normalizedScore = Math.round((earnedScore / totalWeight) * 100);
    return Math.min(100, Math.max(0, normalizedScore));
  }
}

export const scoringEngine = new ComplianceScoringEngine();
