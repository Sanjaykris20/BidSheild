import {
  RequirementEvaluation,
  RiskLevel,
  RiskAnalysisResult,
  RiskDriver
} from '@/types';

export class RiskCalculationEngine {
  /**
   * Evaluates compliance findings to generate structured risk profiles, score bands, and driver insights.
   */
  calculateRisk(score: number, evaluations: RequirementEvaluation[]): RiskAnalysisResult {
    let riskLevel: RiskLevel = 'LOW';
    if (score >= 90) riskLevel = 'LOW';
    else if (score >= 70) riskLevel = 'MEDIUM';
    else if (score >= 50) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';

    // Hard gating: If debarment rule fails, automatically escalate to CRITICAL
    const debarFail = evaluations.find(e => e.ruleCode.includes('DEBAR') && e.status === 'FAIL');
    if (debarFail) {
      riskLevel = 'CRITICAL';
    }

    const drivers: RiskDriver[] = [];

    // Analyze failed and review rules for risk drivers
    for (const item of evaluations) {
      if (item.status === 'FAIL') {
        if (item.ruleCode.includes('LC') || item.ruleCode.includes('MII')) {
          drivers.push({
            factor: 'LOCAL_CONTENT_SHORTFALL',
            severity: 'HIGH',
            impactScore: 15,
            description: `${item.title}: Extracted local content is below mandatory threshold. Shortfall: ${item.difference || 'Below requirement'}.`,
            evidenceRef: item.id,
          });
        } else if (item.ruleCode.includes('DEBAR')) {
          drivers.push({
            factor: 'DEBARMENT_GATING_VIOLATION',
            severity: 'CRITICAL',
            impactScore: 25,
            description: 'Critical gating failure: Entity or key principal identified on central debarment register.',
            evidenceRef: item.id,
          });
        } else if (item.ruleCode.includes('GST') || item.ruleCode.includes('PAN')) {
          drivers.push({
            factor: 'STATUTORY_IDENTITY_ANOMALY',
            severity: 'HIGH',
            impactScore: 15,
            description: `${item.title}: Identity verification returned discrepancy or inactive taxpayer status.`,
            evidenceRef: item.id,
          });
        } else {
          drivers.push({
            factor: 'TECHNICAL_REQUIREMENT_SHORTFALL',
            severity: item.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
            impactScore: 10,
            description: `${item.title}: Failed requirement criteria.`,
            evidenceRef: item.id,
          });
        }
      } else if (item.status === 'REVIEW') {
        drivers.push({
          factor: 'DOCUMENTATION_SCRUTINY_REQUIRED',
          severity: 'MEDIUM',
          impactScore: 5,
          description: `${item.title}: Requires procurement officer verification review.`,
          evidenceRef: item.id,
        });
      }
    }

    // Category breakdowns
    const statutoryItems = evaluations.filter(e => e.category === 'Statutory' || e.category === 'Integrity');
    const technicalItems = evaluations.filter(e => e.category === 'Technical' || e.category === 'Make-in-India');
    const financialItems = evaluations.filter(e => e.category === 'Financial');
    const docItems = evaluations.filter(e => e.category === 'Documentation');

    const calcCategoryScore = (items: RequirementEvaluation[]) => {
      if (items.length === 0) return 100;
      const passed = items.filter(i => i.status === 'PASS' || i.status === 'NOT_APPLICABLE').length;
      const reviewed = items.filter(i => i.status === 'REVIEW').length;
      return Math.round(((passed + reviewed * 0.5) / items.length) * 100);
    };

    let summary = '';
    if (riskLevel === 'LOW') {
      summary = 'Low Risk. The submission passes all statutory, technical, and Make-in-India gating criteria with high confidence.';
    } else if (riskLevel === 'MEDIUM') {
      summary = `Medium Risk (${score}/100). Identity and statutory compliance are solid, but specific requirements (${drivers.map(d => d.factor).join(', ') || 'minor gaps'}) require officer scrutiny or clarification.`;
    } else if (riskLevel === 'HIGH') {
      summary = `High Risk (${score}/100). Significant non-compliance flags detected. Comprehensive audit scrutiny and mandatory verification proof required.`;
    } else {
      summary = `Critical Risk (${score}/100). Severe non-compliance or debarment flags detected. Proposal is subject to automatic technical disqualification.`;
    }

    return {
      score,
      riskLevel,
      drivers,
      categoryBreakdown: {
        identityConsistency: calcCategoryScore(evaluations.filter(e => e.ruleCode.includes('PAN') || e.ruleCode.includes('GST'))),
        statutoryCompliance: calcCategoryScore(statutoryItems),
        financialEligibility: calcCategoryScore(financialItems),
        technicalEligibility: calcCategoryScore(technicalItems),
        documentationCompleteness: calcCategoryScore(docItems),
        tenderCompliance: score,
      },
      summary,
    };
  }
}

export const riskEngine = new RiskCalculationEngine();
