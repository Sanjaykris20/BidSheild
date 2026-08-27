/**
 * Evidence API Routes
 * Module 5: Evidence retrieval for split-screen viewer
 */

const express = require('express');
const router = express.Router();

const { evidenceEngine } = require('../shared/store');

/**
 * POST /api/evidence/override
 * Add manual override evidence (Module 2 officer decision)
 */
router.post('/override', (req, res) => {
    const {
        officer_id,
        original_result,
        new_result,
        reason,
        requirement_id,
        rule_id,
        bid_id
    } = req.body;

    if (!officer_id || !original_result || !new_result || !reason || !requirement_id || !rule_id) {
        return res.status(400).json({ error: 'All fields required' });
    }

    const evidence = evidenceEngine.addOverrideEvidence({
        officer_id,
        original_result,
        new_result,
        reason,
        requirement_id,
        rule_id
    });

    evidence.details.bid_id = bid_id;

    res.json({ success: true, evidence });
});

/**
 * GET /api/evidence/requirement/{requirement_id}
 * Get evidence for a specific requirement
 */
router.get('/requirement/:requirementId', (req, res) => {
    const { requirementId } = req.params;
    const evidence = evidenceEngine.getEvidenceByRequirement(requirementId);
    res.json({ requirement_id: requirementId, evidence });
});

/**
 * GET /api/bids/{bid_id}/evidence
 * Get all evidence for a bid
 */
router.get('/bids/:bidId/evidence', (req, res) => {
    const { bidId } = req.params;
    const { result, source, rule_id, min_confidence } = req.query;

    const evidence = evidenceEngine.searchEvidence({
        bid_id: bidId,
        result,
        verification_source: source,
        rule_id,
        min_confidence: min_confidence ? parseFloat(min_confidence) : undefined
    });

    res.json({
        bid_id: bidId,
        total: evidence.length,
        evidence
    });
});

/**
 * GET /api/bids/{bid_id}/evidence/summary
 * Get evidence summary for a bid
 */
router.get('/bids/:bidId/evidence/summary', (req, res) => {
    const { bidId } = req.params;
    const summary = evidenceEngine.getEvidenceSummary(bidId);
    res.json(summary);
});

/**
 * GET /api/bids/{bid_id}/evidence/export
 * Export evidence for audit trail
 */
router.get('/bids/:bidId/evidence/export', (req, res) => {
    const { bidId } = req.params;
    const auditData = evidenceEngine.exportForAudit(bidId);
    res.json(auditData);
});

/**
 * GET /api/evidence/{id}
 * Get specific evidence record
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const evidence = evidenceEngine.getEvidence(id);

    if (!evidence) {
        return res.status(404).json({ error: 'Evidence not found' });
    }

    res.json(evidence);
});

module.exports = router;
