/**
 * Compliance Rule Engine
 * Module 5: Deterministic evaluation of compliance rules
 * Reads rules authored by Module 3, evaluates against verification results
 */

const { registry } = require('../verification/providers');

class ComplianceEngine {
    constructor(config = {}) {
        this.config = config;
        this.ruleWeights = config.ruleWeights || this.getDefaultWeights();
    }

    getDefaultWeights() {
        return {
            GST: 10,
            PAN: 10,
            UDYAM: 10,
            TAX: 15,
            LOCAL_CONTENT: 15,
            OEM: 15,
            DOCUMENTS: 10,
            DEBARMENT: 15
        };
    }

    /**
     * Run full compliance check for a bid
     * @param {string} bidId
     * @param {object} bidData - Bid data including extracted fields, documents, tender requirements
     * @returns {Promise<object>} Compliance Result
     */
    async runCompliance(bidId, bidData) {
        const {
            extractedFields = {},
            documents = [],
            tenderRequirements = {},
            verificationResults = {},
            context = {}
        } = bidData;

        // 1. Run government verifications if not provided
        const govVerifications = await this.runGovernmentVerifications(extractedFields, context);

        // 2. Merge with provided verification results
        const allVerifications = { ...govVerifications, ...verificationResults };

        // 3. Evaluate compliance rules
        const ruleResults = this.evaluateRules(allVerifications, extractedFields, tenderRequirements, documents);

        // 4. Calculate score
        const scoreResult = this.calculateScore(ruleResults);

        // 5. Calculate risk
        const riskResult = this.calculateRisk(ruleResults, scoreResult);

        // 6. Generate evidence
        const evidence = this.generateEvidence(ruleResults, allVerifications, extractedFields, documents);

        return {
            bid_id: bidId,
            score: scoreResult.score,
            risk_level: scoreResult.risk_level,
            passed_count: ruleResults.filter(r => r.result === 'PASS').length,
            review_count: ruleResults.filter(r => r.result === 'REVIEW').length,
            failed_count: ruleResults.filter(r => r.result === 'FAIL').length,
            risk_drivers: riskResult.risk_drivers,
            rule_results: ruleResults,
            evidence,
            evaluated_at: new Date().toISOString()
        };
    }

    /**
     * Run government verifications for extracted fields
     * @param {object} fields
     * @param {object} context
     * @returns {Promise<object>}
     */
    async runGovernmentVerifications(fields, context = {}) {
        const results = {};
        const providerMap = {
            gstin: 'gst',
            udyam_number: 'udyam',
            pan: 'pan',
            pan_number: 'pan',
            establishment_code: 'epfo',
            esi_code: 'esic',
            dipp_number: 'startup',
            nsic_number: 'nsic',
            oem_certificate: 'oem',
            digilocker_doc_id: 'digilocker'
        };

        for (const [field, providerKey] of Object.entries(providerMap)) {
            const value = fields[field];
            if (value) {
                const provider = registry.getProvider(providerKey);
                if (provider) {
                    try {
                        results[providerKey] = await provider.verify(value, context);
                    } catch (error) {
                        results[providerKey] = {
                            status: 'VERIFICATION_FAILED',
                            source: provider.source,
                            verified_at: new Date().toISOString(),
                            data: { error: error.message },
                            confidence: 0
                        };
                    }
                }
            }
        }

        // Always run debarment check with all identifiers
        const debarmentProvider = registry.getProvider('debarment');
        if (debarmentProvider) {
            results.debarment = await debarmentProvider.verify(fields.pan || fields.gstin, fields);
        }

        return results;
    }

    /**
     * Evaluate all compliance rules
     * @param {object} verifications
     * @param {object} fields
     * @param {object} requirements
     * @param {Array} documents
     * @returns {Array}
     */
    evaluateRules(verifications, fields, requirements, documents) {
        const rules = this.getRuleDefinitions(requirements);
        const results = [];

        for (const rule of rules) {
            const result = this.evaluateRule(rule, verifications, fields, documents);
            results.push(result);
        }

        return results;
    }

    /**
     * Get rule definitions based on tender requirements
     * In production, these come from Module 3's rule authoring UI
     * @param {object} requirements
     * @returns {Array}
     */
    getRuleDefinitions(requirements = {}) {
        return [
            {
                id: 'REQ-GST-01',
                name: 'GST Registration Validity',
                type: 'GOVERNMENT_VERIFICATION',
                source: 'GST',
                severity: 'HIGH',
                weight: this.ruleWeights.GST,
                evaluate: (v, f, d) => this.evalGovVerification(v.gst, 'VERIFIED')
            },
            {
                id: 'REQ-PAN-01',
                name: 'PAN Validity',
                type: 'GOVERNMENT_VERIFICATION',
                source: 'PAN',
                severity: 'HIGH',
                weight: this.ruleWeights.PAN,
                evaluate: (v, f, d) => this.evalGovVerification(v.pan, 'VERIFIED')
            },
            {
                id: 'REQ-UDYAM-01',
                name: 'Udyam/MSME Registration',
                type: 'GOVERNMENT_VERIFICATION',
                source: 'UDYAM',
                severity: 'MEDIUM',
                weight: this.ruleWeights.UDYAM,
                evaluate: (v, f, d) => this.evalGovVerification(v.udyam, 'VERIFIED')
            },
            {
                id: 'REQ-TAX-01',
                name: 'Income Tax Compliance',
                type: 'GOVERNMENT_VERIFICATION',
                source: 'INCOME_TAX',
                severity: 'HIGH',
                weight: this.ruleWeights.TAX,
                evaluate: (v, f, d) => this.evalGovVerification(v.income_tax, 'VERIFIED')
            },
            {
                id: 'REQ-EPFO-01',
                name: 'EPFO Compliance',
                type: 'GOVERNMENT_VERIFICATION',
                source: 'EPFO',
                severity: 'MEDIUM',
                weight: 5,
                evaluate: (v, f, d) => this.evalGovVerification(v.epfo, 'VERIFIED')
            },
            {
                id: 'REQ-ESIC-01',
                name: 'ESIC Compliance',
                type: 'GOVERNMENT_VERIFICATION',
                source: 'ESIC',
                severity: 'MEDIUM',
                weight: 5,
                evaluate: (v, f, d) => this.evalGovVerification(v.esic, 'VERIFIED')
            },
            {
                id: 'REQ-LC-01',
                name: 'Local Content Threshold',
                type: 'LOCAL_CONTENT',
                severity: 'HIGH',
                weight: this.ruleWeights.LOCAL_CONTENT,
                evaluate: (v, f, d) => this.evalLocalContent(f, requirements)
            },
            {
                id: 'REQ-OEM-01',
                name: 'OEM Authorization',
                type: 'GOVERNMENT_VERIFICATION',
                source: 'OEM',
                severity: 'HIGH',
                weight: this.ruleWeights.OEM,
                evaluate: (v, f, d) => this.evalOEM(v.oem, f, requirements)
            },
            {
                id: 'REQ-DOC-01',
                name: 'Mandatory Documents Present',
                type: 'DOCUMENT_CHECK',
                severity: 'MEDIUM',
                weight: this.ruleWeights.DOCUMENTS,
                evaluate: (v, f, d) => this.evalDocuments(d, requirements)
            },
            {
                id: 'REQ-DEB-01',
                name: 'Debarment Check',
                type: 'GOVERNMENT_VERIFICATION',
                source: 'DEBARMENT',
                severity: 'CRITICAL',
                weight: this.ruleWeights.DEBARMENT,
                evaluate: (v, f, d) => this.evalDebarment(v.debarment)
            },
            {
                id: 'REQ-STARTUP-01',
                name: 'Startup Recognition',
                type: 'GOVERNMENT_VERIFICATION',
                source: 'STARTUP',
                severity: 'LOW',
                weight: 5,
                evaluate: (v, f, d) => this.evalGovVerification(v.startup, 'VERIFIED')
            },
            {
                id: 'REQ-NSIC-01',
                name: 'NSIC Registration',
                type: 'GOVERNMENT_VERIFICATION',
                source: 'NSIC',
                severity: 'LOW',
                weight: 5,
                evaluate: (v, f, d) => this.evalGovVerification(v.nsic, 'VERIFIED')
            }
        ];
    }

    /**
     * Evaluate a single rule
     * @param {object} rule
     * @param {object} verifications
     * @param {object} fields
     * @param {Array} documents
     * @returns {object}
     */
    evaluateRule(rule, verifications, fields, documents) {
        try {
            const evalResult = rule.evaluate(verifications, fields, documents);

            return {
                rule_id: rule.id,
                rule_name: rule.name,
                rule_type: rule.type,
                severity: rule.severity,
                weight: rule.weight,
                result: evalResult.result,
                confidence: evalResult.confidence,
                expected: evalResult.expected,
                actual: evalResult.actual,
                details: evalResult.details,
                evidence_ref: evalResult.evidence_ref
            };
        } catch (error) {
            return {
                rule_id: rule.id,
                rule_name: rule.name,
                rule_type: rule.type,
                severity: rule.severity,
                weight: rule.weight,
                result: 'VERIFICATION_FAILED',
                confidence: 0,
                expected: 'N/A',
                actual: 'ERROR',
                details: { error: error.message },
                evidence_ref: null
            };
        }
    }

    // Evaluation helpers
    evalGovVerification(verification, expectedStatus) {
        if (!verification) {
            return { result: 'FAIL', confidence: 0, expected: expectedStatus, actual: 'MISSING', details: { reason: 'Verification not performed' } };
        }

        const status = verification.status;
        const isVerified = status === expectedStatus;

        return {
            result: isVerified ? 'PASS' : (status === 'NOT_FOUND' ? 'FAIL' : 'REVIEW'),
            confidence: verification.confidence || 0,
            expected: expectedStatus,
            actual: status,
            details: { source: verification.source, data: verification.data, latency_ms: verification.latency_ms },
            evidence_ref: `GOV-${verification.source}-${Date.now()}`
        };
    }

    evalLocalContent(fields, requirements) {
        const required = requirements.min_local_content || 50;
        const actual = fields.local_content_percentage || 0;

        const pass = actual >= required;
        const confidence = 0.98; // High confidence from AI extraction

        return {
            result: pass ? 'PASS' : 'FAIL',
            confidence,
            expected: `>= ${required}%`,
            actual: `${actual}%`,
            details: {
                required_percentage: required,
                actual_percentage: actual,
                source_document: fields.local_content_source_doc,
                source_page: fields.local_content_source_page
            },
            evidence_ref: `LC-${Date.now()}`
        };
    }

    evalOEM(verification, fields, requirements) {
        // OEM required only if tender specifies OEM products
        if (!requirements.oem_required) {
            return { result: 'NOT_APPLICABLE', confidence: 1, expected: 'N/A', actual: 'N/A', details: { reason: 'OEM not required for this tender' }, evidence_ref: null };
        }

        if (!verification) {
            return { result: 'FAIL', confidence: 0, expected: 'VERIFIED', actual: 'MISSING', details: { reason: 'OEM verification not performed' }, evidence_ref: null };
        }

        const status = verification.status;
        const isValid = status === 'VERIFIED';
        const isExpired = verification.data?.expiry_date && new Date(verification.data.expiry_date) < new Date();

        return {
            result: isValid && !isExpired ? 'PASS' : (isExpired ? 'EXPIRED' : 'FAIL'),
            confidence: verification.confidence || 0,
            expected: 'VALID_AUTHORIZATION',
            actual: isExpired ? 'EXPIRED' : status,
            details: { source: 'OEM', data: verification.data },
            evidence_ref: `OEM-${Date.now()}`
        };
    }

    evalDocuments(documents, requirements) {
        const requiredDocs = requirements.mandatory_documents || [];
        const uploadedTypes = documents.map(d => d.category).filter(Boolean);

        const missing = requiredDocs.filter(req => !uploadedTypes.includes(req));
        const pass = missing.length === 0;

        return {
            result: pass ? 'PASS' : 'FAIL',
            confidence: 0.95,
            expected: requiredDocs.join(', '),
            actual: uploadedTypes.join(', ') || 'NONE',
            details: { required: requiredDocs, uploaded: uploadedTypes, missing },
            evidence_ref: `DOC-${Date.now()}`
        };
    }

    evalDebarment(verification) {
        if (!verification) {
            return { result: 'FAIL', confidence: 0, expected: 'NOT_DEBARRED', actual: 'NOT_CHECKED', details: { reason: 'Debarment check not performed' }, evidence_ref: null };
        }

        const isDebarred = verification.data?.debarred === true;

        return {
            result: isDebarred ? 'FAIL' : 'PASS',
            confidence: verification.confidence || 0,
            expected: 'NOT_DEBARRED',
            actual: isDebarred ? 'DEBARRED' : 'CLEAR',
            details: {
                source: 'DEBARMENT',
                data: verification.data,
                checked_sources: verification.data?.checked_sources
            },
            evidence_ref: `DEB-${Date.now()}`
        };
    }

    /**
     * Calculate compliance score
     * @param {Array} ruleResults
     * @returns {object}
     */
    calculateScore(ruleResults) {
        let totalWeight = 0;
        let earnedWeight = 0;

        for (const rule of ruleResults) {
            if (rule.result === 'NOT_APPLICABLE') continue;

            totalWeight += rule.weight;

            switch (rule.result) {
                case 'PASS':
                    earnedWeight += rule.weight;
                    break;
                case 'REVIEW':
                    earnedWeight += rule.weight * 0.5;
                    break;
                case 'EXPIRED':
                    earnedWeight += rule.weight * 0.3;
                    break;
                case 'FAIL':
                case 'VERIFICATION_FAILED':
                case 'MISSING':
                    earnedWeight += 0;
                    break;
            }
        }

        const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

        let risk_level;
        if (score >= 90) risk_level = 'LOW';
        else if (score >= 70) risk_level = 'MEDIUM';
        else if (score >= 50) risk_level = 'HIGH';
        else risk_level = 'CRITICAL';

        return { score, risk_level, total_weight: totalWeight, earned_weight: earnedWeight };
    }

    /**
     * Calculate risk drivers
     * @param {Array} ruleResults
     * @param {object} scoreResult
     * @returns {object}
     */
    calculateRisk(ruleResults, scoreResult) {
        const riskDrivers = [];

        // Map rule types to risk factors
        const riskFactorMap = {
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
            if (['FAIL', 'EXPIRED', 'VERIFICATION_FAILED'].includes(rule.result)) {
                const factor = riskFactorMap[rule.source] || rule.type;
                const severity = rule.severity === 'CRITICAL' ? 'HIGH' :
                                 rule.severity === 'HIGH' ? 'HIGH' :
                                 rule.severity === 'MEDIUM' ? 'MEDIUM' : 'LOW';

                riskDrivers.push({ factor, severity });
            }
        }

        // Deduplicate
        const uniqueDrivers = [];
        const seen = new Set();
        for (const driver of riskDrivers) {
            const key = `${driver.factor}-${driver.severity}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueDrivers.push(driver);
            }
        }

        return { risk_drivers: uniqueDrivers };
    }

    /**
     * Generate evidence for each rule result
     * @param {Array} ruleResults
     * @param {object} verifications
     * @param {object} fields
     * @param {Array} documents
     * @returns {Array}
     */
    generateEvidence(ruleResults, verifications, fields, documents) {
        return ruleResults.map(rule => ({
            requirement_id: rule.rule_id,
            document_id: rule.evidence_ref,
            page_number: this.getPageNumber(rule, fields),
            extracted_value: rule.actual,
            expected_value: rule.expected,
            actual_value: rule.actual,
            verification_source: rule.source || rule.rule_type,
            rule_id: rule.rule_id,
            result: rule.result,
            confidence: rule.confidence,
            details: rule.details
        })).filter(e => e.document_id);
    }

    getPageNumber(rule, fields) {
        if (rule.rule_id === 'REQ-LC-01') return fields.local_content_source_page || 1;
        if (rule.rule_id === 'REQ-OEM-01') return fields.oem_source_page || 1;
        return 1;
    }

    /**
     * Update rule weights (called by Module 3 admin)
     * @param {object} weights
     */
    updateWeights(weights) {
        this.ruleWeights = { ...this.ruleWeights, ...weights };
    }
}

module.exports = ComplianceEngine;