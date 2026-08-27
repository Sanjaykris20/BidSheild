/**
 * Compliance API Routes
 * Module 5: Compliance results and summaries
 */

const express = require('express');
const router = express.Router();

const { complianceEngine, complianceStore } = require('../shared/store');

/**
 * POST /api/compliance/run/{bid_id}
 * Run compliance check for a bid
 */
router.post('/run/:bidId', async (req, res) => {
    try {
        const { bidId } = req.params;
        let bidData = req.body;

        if (bidData && bidData.bid_data) {
            bidData = bidData.bid_data;
        }

        if (!bidData) {
            return res.status(400).json({ error: 'Bid data required' });
        }

        const result = await complianceEngine.runCompliance(bidId, bidData);
        complianceStore.set(bidId, result);

        res.json(result);
    } catch (error) {
        console.error('Compliance run error:', error);
        res.status(500).json({ error: 'Compliance check failed', details: error.message });
    }
});

/**
 * PUT /api/compliance/weights
 * Update rule weights (admin)
 */
router.put('/weights', (req, res) => {
    const { weights } = req.body;
    if (!weights || typeof weights !== 'object') {
        return res.status(400).json({ error: 'Weights object required' });
    }

    complianceEngine.updateWeights(weights);
    res.json({ success: true, weights: complianceEngine.ruleWeights });
});

/**
 * GET /api/compliance/weights
 * Get current rule weights
 */
router.get('/weights', (req, res) => {
    res.json({ weights: complianceEngine.ruleWeights });
});

/**
 * GET /api/compliance/{bid_id}
 * Get full compliance result for a bid
 */
router.get('/:bidId', (req, res) => {
    const { bidId } = req.params;
    const result = complianceStore.get(bidId);

    if (!result) {
        return res.status(404).json({ error: 'Compliance result not found' });
    }

    res.json(result);
});

/**
 * GET /api/compliance/{bid_id}/summary
 * Get compliance summary for a bid
 */
router.get('/:bidId/summary', (req, res) => {
    const { bidId } = req.params;
    const result = complianceStore.get(bidId);

    if (!result) {
        return res.status(404).json({ error: 'Compliance result not found' });
    }

    res.json({
        bid_id: bidId,
        score: result.score,
        risk_level: result.risk_level,
        passed_count: result.passed_count,
        review_count: result.review_count,
        failed_count: result.failed_count,
        risk_drivers: result.risk_drivers,
        evaluated_at: result.evaluated_at
    });
});

/**
 * GET /api/compliance/{bid_id}/failed
 * Get failed compliance rules for a bid
 */
router.get('/:bidId/failed', (req, res) => {
    const { bidId } = req.params;
    const result = complianceStore.get(bidId);

    if (!result) {
        return res.status(404).json({ error: 'Compliance result not found' });
    }

    const failed = result.rule_results.filter(r =>
        ['FAIL', 'EXPIRED', 'VERIFICATION_FAILED', 'MISSING'].includes(r.result)
    );

    res.json({
        bid_id: bidId,
        failed_count: failed.length,
        failed_rules: failed
    });
});

module.exports = router;