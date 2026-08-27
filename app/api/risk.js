/**
 * Risk API Routes
 * Module 5: Risk calculation and analysis
 */

const express = require('express');
const router = express.Router();

const { riskEngine, complianceEngine, complianceStore } = require('../shared/store');

/**
 * POST /api/risk/calculate/{bid_id}
 * Calculate risk for a bid
 */
router.post('/calculate/:bidId', (req, res) => {
    try {
        const { bidId } = req.params;
        const complianceResult = complianceStore.get(bidId);

        if (!complianceResult) {
            return res.status(404).json({ error: 'Compliance result not found. Run compliance first.' });
        }

        const riskResult = riskEngine.calculateRisk(bidId, complianceResult);
        res.json(riskResult);
    } catch (error) {
        console.error('Risk calculation error:', error);
        res.status(500).json({ error: 'Risk calculation failed', details: error.message });
    }
});

/**
 * PUT /api/risk/thresholds
 * Update risk thresholds (admin)
 */
router.put('/thresholds', (req, res) => {
    const { thresholds } = req.body;
    if (!thresholds || typeof thresholds !== 'object') {
        return res.status(400).json({ error: 'Thresholds object required' });
    }

    riskEngine.updateThresholds(thresholds);
    res.json({ success: true, thresholds: riskEngine.riskThresholds });
});

/**
 * GET /api/risk/thresholds
 * Get current risk thresholds
 */
router.get('/thresholds', (req, res) => {
    res.json({ thresholds: riskEngine.riskThresholds });
});

/**
 * PUT /api/risk/factor-weights
 * Update risk factor weights (admin)
 */
router.put('/factor-weights', (req, res) => {
    const { weights } = req.body;
    if (!weights || typeof weights !== 'object') {
        return res.status(400).json({ error: 'Weights object required' });
    }

    riskEngine.updateFactorWeights(weights);
    res.json({ success: true, weights: riskEngine.riskFactorWeights });
});

/**
 * GET /api/risk/factor-weights
 * Get current risk factor weights
 */
router.get('/factor-weights', (req, res) => {
    res.json({ weights: riskEngine.riskFactorWeights });
});

/**
 * GET /api/risk/{bid_id}
 * Get risk analysis for a bid
 */
router.get('/:bidId', (req, res) => {
    const { bidId } = req.params;
    const complianceResult = complianceStore.get(bidId);

    if (!complianceResult) {
        return res.status(404).json({ error: 'Compliance result not found' });
    }

    const riskResult = riskEngine.calculateRisk(bidId, complianceResult);
    res.json(riskResult);
});

module.exports = router;