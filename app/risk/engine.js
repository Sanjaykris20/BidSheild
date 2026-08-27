/**
 * Risk Engine
 * Module 5: Calculates risk levels and drivers from compliance results
 */

class RiskEngine {
    constructor(config = {}) {
        this.config = config;
        this.riskThresholds = config.riskThresholds || {
            LOW: 90,
            MEDIUM: 70,
            HIGH: 50,
            CRITICAL: 0
        };

        this.riskFactorWeights = config.riskFactorWeights || {
            'Identity Consistency': 1.0,
            'Statutory Compliance': 1.2,
            'Financial Eligibility': 1.1,
            'Technical Eligibility': 1.0,
            'Documentation': 0.8,
            'Tender Compliance': 1.3
        };
    }

    /**
     * Calculate risk for a bid
     * @param {string} bidId
     * @param {object} complianceResult - Output from ComplianceEngine
     * @returns {object}
     */
    calculateRisk(bidId, complianceResult) {
        const { score, rule_results, risk_drivers = [] } = complianceResult;

        // Base risk level from score
        let riskLevel;
        if (score >= this.riskThresholds.LOW) riskLevel = 'LOW';
        else if (score >= this.riskThresholds.MEDIUM) riskLevel = 'MEDIUM';
        else if (score >= this.riskThresholds.HIGH) riskLevel = 'HIGH';
        else riskLevel = 'CRITICAL';

        // Enhance with rule-level analysis
        const enhancedDrivers = this.analyzeRuleRisks(rule_results);

        // Combine with compliance engine drivers
        const allDrivers = [...risk_drivers, ...enhancedDrivers];
        const uniqueDrivers = this.deduplicateDrivers(allDrivers);

        // Calculate risk score (inverse of compliance score with factor weighting)
        const riskScore = this.calculateRiskScore(rule_results);

        return {
            bid_id: bidId,
            risk_level: riskLevel,
            risk_score: riskScore,
            risk_drivers: uniqueDrivers,
            compliance_score: score,
            factor_breakdown: this.getFactorBreakdown(rule_results),
            calculated_at: new Date().toISOString()
        };
    }

    /**
     * Analyze individual rule risks
     * @param {Array} ruleResults
     * @returns {Array}
     */
    analyzeRuleRisks(ruleResults) {
        const drivers = [];

        const factorMap = {
            'GST': 'Statutory Compliance',
            'PAN': 'Identity Consistency',
            'UDYAM': 'Statutory Compliance',
            'INCOME_TAX': 'Financial Eligibility',
            'EPFO': 'Statutory Compliance',
            'ESIC': 'Statutory Compliance',
            'LOCAL_CONTENT': 'Tender Compliance',
            'OEM': 'Technical Eligibility',
            'DOCUMENT_CHECK': 'Documentation',
            'DEBARMENT': 'Statutory Compliance',
            'STARTUP': 'Technical Eligibility',
            'NSIC': 'Technical Eligibility'
        };

        const severityMap = {
            'CRITICAL': 'HIGH',
            'HIGH': 'HIGH',
            'MEDIUM': 'MEDIUM',
            'LOW': 'LOW'
        };

        for (const rule of ruleResults) {
            if (['FAIL', 'EXPIRED', 'VERIFICATION_FAILED', 'MISSING'].includes(rule.result)) {
                const factor = factorMap[rule.source] || rule.type;
                const baseSeverity = severityMap[rule.severity] || 'MEDIUM';

                // Adjust severity based on weight
                const weight = rule.weight || 10;
                let severity = baseSeverity;
                if (weight >= 15 && baseSeverity === 'MEDIUM') severity = 'HIGH';
                if (weight >= 15 && baseSeverity === 'LOW') severity = 'MEDIUM';

                drivers.push({
                    factor,
                    severity,
                    rule_id: rule.rule_id,
                    rule_name: rule.rule_name,
                    weight
                });
            }
        }

        return drivers;
    }

    /**
     * Calculate numeric risk score
     * @param {Array} ruleResults
     * @returns {number}
     */
    calculateRiskScore(ruleResults) {
        let totalRisk = 0;
        let maxRisk = 0;

        for (const rule of ruleResults) {
            const factorWeight = this.riskFactorWeights[rule.source] || 1.0;
            const ruleWeight = rule.weight || 10;
            maxRisk += ruleWeight * factorWeight;

            if (['FAIL', 'EXPIRED', 'VERIFICATION_FAILED'].includes(rule.result)) {
                const severityMultiplier = rule.severity === 'CRITICAL' ? 1.0 :
                                          rule.severity === 'HIGH' ? 0.8 :
                                          rule.severity === 'MEDIUM' ? 0.5 : 0.3;
                totalRisk += ruleWeight * factorWeight * severityMultiplier;
            } else if (rule.result === 'REVIEW') {
                totalRisk += ruleWeight * factorWeight * 0.2;
            }
        }

        return maxRisk > 0 ? Math.round((totalRisk / maxRisk) * 100) : 0;
    }

    /**
     * Get factor breakdown for dashboard
     * @param {Array} ruleResults
     * @returns {object}
     */
    getFactorBreakdown(ruleResults) {
        const factors = {
            'Identity Consistency': { pass: 0, fail: 0, total: 0 },
            'Statutory Compliance': { pass: 0, fail: 0, total: 0 },
            'Financial Eligibility': { pass: 0, fail: 0, total: 0 },
            'Technical Eligibility': { pass: 0, fail: 0, total: 0 },
            'Documentation': { pass: 0, fail: 0, total: 0 },
            'Tender Compliance': { pass: 0, fail: 0, total: 0 }
        };

        const factorMap = {
            'GST': 'Statutory Compliance',
            'PAN': 'Identity Consistency',
            'UDYAM': 'Statutory Compliance',
            'INCOME_TAX': 'Financial Eligibility',
            'EPFO': 'Statutory Compliance',
            'ESIC': 'Statutory Compliance',
            'LOCAL_CONTENT': 'Tender Compliance',
            'OEM': 'Technical Eligibility',
            'DOCUMENT_CHECK': 'Documentation',
            'DEBARMENT': 'Statutory Compliance',
            'STARTUP': 'Technical Eligibility',
            'NSIC': 'Technical Eligibility'
        };

        for (const rule of ruleResults) {
            const factor = factorMap[rule.source] || rule.type;
            if (!factors[factor]) continue;

            factors[factor].total++;
            if (rule.result === 'PASS') factors[factor].pass++;
            else if (['FAIL', 'EXPIRED', 'VERIFICATION_FAILED'].includes(rule.result)) factors[factor].fail++;
        }

        // Calculate percentages
        const breakdown = {};
        for (const [factor, counts] of Object.entries(factors)) {
            breakdown[factor] = {
                total: counts.total,
                passed: counts.pass,
                failed: counts.fail,
                score: counts.total > 0 ? Math.round((counts.pass / counts.total) * 100) : 100
            };
        }

        return breakdown;
    }

    deduplicateDrivers(drivers) {
        const seen = new Set();
        return drivers.filter(d => {
            const key = `${d.factor}-${d.severity}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    /**
     * Get risk level from score
     * @param {number} score
     * @returns {string}
     */
    getRiskLevel(score) {
        if (score >= this.riskThresholds.LOW) return 'LOW';
        if (score >= this.riskThresholds.MEDIUM) return 'MEDIUM';
        if (score >= this.riskThresholds.HIGH) return 'HIGH';
        return 'CRITICAL';
    }

    /**
     * Update risk thresholds (admin function)
     * @param {object} thresholds
     */
    updateThresholds(thresholds) {
        this.riskThresholds = { ...this.riskThresholds, ...thresholds };
    }

    /**
     * Update factor weights (admin function)
     * @param {object} weights
     */
    updateFactorWeights(weights) {
        this.riskFactorWeights = { ...this.riskFactorWeights, ...weights };
    }
}

module.exports = RiskEngine;