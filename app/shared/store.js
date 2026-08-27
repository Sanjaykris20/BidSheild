/**
 * Shared in-memory state store
 * Used by compliance, risk, and evidence API routes
 */

const ComplianceEngine = require('../compliance/engine');
const RiskEngine = require('../risk/engine');
const EvidenceEngine = require('../evidence/engine');

const complianceEngine = new ComplianceEngine();
const riskEngine = new RiskEngine();
const evidenceEngine = new EvidenceEngine();

const complianceStore = new Map();

module.exports = {
    complianceEngine,
    riskEngine,
    evidenceEngine,
    complianceStore
};