/**
 * Verification API Routes
 * Module 5: API endpoints for verification and compliance
 * Matches the contract in 00_SHARED_ARCHITECTURE.md Sections 30-35
 */

const express = require('express');
const router = express.Router();

const { complianceEngine, riskEngine, evidenceEngine, complianceStore } = require('../shared/store');
const { registry } = require('../verification/providers');
const bidStore = new Map();

/**
 * POST /api/verification/run/{bid_id}
 * Run full verification pipeline for a bid
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

        // Store bid data
        bidStore.set(bidId, bidData);

        // Run compliance check
        const result = await complianceEngine.runCompliance(bidId, bidData);

        // Store compliance result in shared store for later retrieval
        complianceStore.set(bidId, result);

        // Calculate risk
        const riskResult = riskEngine.calculateRisk(bidId, result);

        // Generate evidence (stored automatically by createEvidenceFromRules)
        const evidence = evidenceEngine.createEvidenceFromRules(
            result.rule_results,
            bidData.verificationResults || {},
            bidData.extractedFields || {},
            bidData.documents || [],
            bidId
        );

        // Return combined result
        res.json({
            ...result,
            risk: riskResult,
            evidence_count: evidence.length
        });

    } catch (error) {
        console.error('Verification run error:', error);
        res.status(500).json({ error: 'Verification failed', details: error.message });
    }
});

/**
 * POST /api/verification/gst
 * Verify GSTIN
 */
router.post('/gst', async (req, res) => {
    try {
        const { identifier: gstin, context = {} } = req.body;
        if (!gstin) return res.status(400).json({ error: 'GSTIN required' });

        const provider = registry.getProvider('gst');
        const result = await provider.verify(gstin, context);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'GST verification failed' });
    }
});

/**
 * POST /api/verification/udyam
 * Verify Udyam Registration
 */
router.post('/udyam', async (req, res) => {
    try {
        const { identifier: udyamNumber, context = {} } = req.body;
        if (!udyamNumber) return res.status(400).json({ error: 'Udyam number required' });

        const provider = registry.getProvider('udyam');
        const result = await provider.verify(udyamNumber, context);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Udyam verification failed' });
    }
});

/**
 * POST /api/verification/pan
 * Verify PAN
 */
router.post('/pan', async (req, res) => {
    try {
        const { identifier: pan, context = {} } = req.body;
        if (!pan) return res.status(400).json({ error: 'PAN required' });

        const provider = registry.getProvider('pan');
        const result = await provider.verify(pan, context);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'PAN verification failed' });
    }
});

/**
 * POST /api/verification/oem
 * Verify OEM Authorization
 */
router.post('/oem', async (req, res) => {
    try {
        const { identifier: oemCertificate, context = {} } = req.body;
        if (!oemCertificate) return res.status(400).json({ error: 'OEM certificate required' });

        const provider = registry.getProvider('oem');
        const result = await provider.verify(oemCertificate, context);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'OEM verification failed' });
    }
});

/**
 * POST /api/verification/debarment
 * Check Debarment
 */
router.post('/debarment', async (req, res) => {
    try {
        const { identifier, ...context } = req.body;
        if (!identifier) return res.status(400).json({ error: 'Identifier required' });

        const provider = registry.getProvider('debarment');
        const result = await provider.verify(identifier, context);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Debarment check failed' });
    }
});

/**
 * GET /api/verification/providers
 * Get all provider health status
 */
router.get('/providers', (req, res) => {
    const providerList = registry.getAllProviders();
    const providers = {};
    providerList.forEach(p => {
        providers[p.key] = p;
    });
    res.json({ providers });
});

/**
 * POST /api/verification/providers/:key/environment
 * Set provider environment (admin)
 */
router.post('/providers/:key/environment', (req, res) => {
    const { key } = req.params;
    const { environment } = req.body;

    if (!['LIVE', 'SANDBOX', 'MOCK'].includes(environment)) {
        return res.status(400).json({ error: 'Invalid environment' });
    }

    const success = registry.setEnvironment(key, environment);
    if (success) {
        res.json({ success: true, provider: key, environment });
    } else {
        res.status(404).json({ error: 'Provider not found' });
    }
});

module.exports = router;