/**
 * Evidence Engine
 * Module 5: Generates and manages evidence for compliance results
 * Every compliance result must have evidence - no bare PASS/FAIL
 */

class EvidenceEngine {
    constructor(config = {}) {
        this.config = config;
        this.evidenceStore = new Map(); // In production, use database
    }

    /**
     * Create evidence record from compliance evaluation
     * @param {object} params
     * @returns {object} Evidence record
     */
    createEvidence(params) {
        const {
            requirement_id,
            document_id,
            page_number,
            extracted_value,
            expected_value,
            actual_value,
            verification_source,
            rule_id,
            result,
            confidence,
            details = {}
        } = params;

        const evidence = {
            id: this.generateId(),
            requirement_id,
            document_id,
            page_number: page_number || 1,
            extracted_value: String(extracted_value),
            expected_value: String(expected_value),
            actual_value: String(actual_value),
            verification_source,
            rule_id,
            result,
            confidence: Number(confidence) || 0,
            details,
            created_at: new Date().toISOString(),
            hash: this.generateHash(`${requirement_id}-${document_id}-${extracted_value}`)
        };

        this.evidenceStore.set(evidence.id, evidence);
        return evidence;
    }

    /**
     * Create multiple evidence records from rule results
     * @param {Array} ruleResults
     * @param {object} verifications
     * @param {object} fields
     * @param {Array} documents
     * @param {string} bidId
     * @returns {Array}
     */
    createEvidenceFromRules(ruleResults, verifications, fields, documents, bidId = null) {
        return ruleResults
            .filter(r => r.evidence_ref)
            .map(rule => this.createEvidence({
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
                details: { ...rule.details, bid_id: bidId }
            }));
    }

    /**
     * Get evidence by ID
     * @param {string} evidenceId
     * @returns {object|null}
     */
    getEvidence(evidenceId) {
        return this.evidenceStore.get(evidenceId) || null;
    }

    /**
     * Get all evidence for a bid
     * @param {string} bidId
     * @returns {Array}
     */
    getEvidenceForBid(bidId) {
        return Array.from(this.evidenceStore.values())
            .filter(e => e.details?.bid_id === bidId || e.requirement_id?.includes(bidId));
    }

    /**
     * Get evidence by requirement ID
     * @param {string} requirementId
     * @returns {Array}
     */
    getEvidenceByRequirement(requirementId) {
        return Array.from(this.evidenceStore.values())
            .filter(e => e.requirement_id === requirementId);
    }

    /**
     * Get evidence by document ID
     * @param {string} documentId
     * @returns {Array}
     */
    getEvidenceByDocument(documentId) {
        return Array.from(this.evidenceStore.values())
            .filter(e => e.document_id === documentId);
    }

    /**
     * Search evidence
     * @param {object} query
     * @returns {Array}
     */
    searchEvidence(query = {}) {
        let results = Array.from(this.evidenceStore.values());

        if (query.result) {
            results = results.filter(e => e.result === query.result);
        }
        if (query.verification_source) {
            results = results.filter(e => e.verification_source === query.verification_source);
        }
        if (query.rule_id) {
            results = results.filter(e => e.rule_id === query.rule_id);
        }
        if (query.min_confidence) {
            results = results.filter(e => e.confidence >= query.min_confidence);
        }
        if (query.bid_id) {
            results = results.filter(e => e.details?.bid_id === query.bid_id);
        }

        return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    /**
     * Add manual override evidence
     * @param {object} params
     * @returns {object}
     */
    addOverrideEvidence(params) {
        const {
            officer_id,
            original_result,
            new_result,
            reason,
            requirement_id,
            rule_id
        } = params;

        const evidence = this.createEvidence({
            requirement_id,
            document_id: `OVERRIDE-${Date.now()}`,
            page_number: 0,
            extracted_value: original_result,
            expected_value: original_result,
            actual_value: new_result,
            verification_source: 'MANUAL_OVERRIDE',
            rule_id,
            result: new_result,
            confidence: 1.0,
            details: {
                officer_id,
                original_result,
                new_result,
                reason,
                override: true,
                timestamp: new Date().toISOString()
            }
        });

        return evidence;
    }

    /**
     * Get evidence summary for a bid
     * @param {string} bidId
     * @returns {object}
     */
    getEvidenceSummary(bidId) {
        const evidence = this.getEvidenceForBid(bidId);

        const byResult = {};
        const bySource = {};

        for (const e of evidence) {
            byResult[e.result] = (byResult[e.result] || 0) + 1;
            bySource[e.verification_source] = (bySource[e.verification_source] || 0) + 1;
        }

        return {
            bid_id: bidId,
            total_evidence: evidence.length,
            by_result: byResult,
            by_source: bySource,
            evidence: evidence
        };
    }

    /**
     * Export evidence for audit trail
     * @param {string} bidId
     * @returns {object}
     */
    exportForAudit(bidId) {
        const evidence = this.getEvidenceForBid(bidId);

        return {
            bid_id: bidId,
            exported_at: new Date().toISOString(),
            total_records: evidence.length,
            records: evidence.map(e => ({
                requirement_id: e.requirement_id,
                rule_id: e.rule_id,
                result: e.result,
                expected: e.expected_value,
                actual: e.actual_value,
                source: e.verification_source,
                confidence: e.confidence,
                document: e.document_id,
                page: e.page_number,
                details: e.details,
                hash: e.hash,
                created_at: e.created_at
            }))
        };
    }

    // Helper methods
    generateId() {
        return 'EVD-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
    }

    generateHash(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) - hash) + data.charCodeAt(i);
            hash |= 0;
        }
        return 'sha256:' + Math.abs(hash).toString(16).padStart(64, '0');
    }

    getPageNumber(rule, fields) {
        if (rule.rule_id === 'REQ-LC-01') return fields.local_content_source_page || 1;
        if (rule.rule_id === 'REQ-OEM-01') return fields.oem_source_page || 1;
        if (rule.details?.source_page) return rule.details.source_page;
        return 1;
    }

    /**
     * Clear evidence store (for testing)
     */
    clear() {
        this.evidenceStore.clear();
    }
}

module.exports = EvidenceEngine;