/**
 * Module 5 Integration Tests
 * Tests the complete verification and compliance pipeline
 */

const ComplianceEngine = require('../app/compliance/engine');
const RiskEngine = require('../app/risk/engine');
const EvidenceEngine = require('../app/evidence/engine');
const { registry } = require('../app/verification/providers');

describe('Module 5: Compliance + Verification Engine', () => {
    let complianceEngine;
    let riskEngine;
    let evidenceEngine;

    beforeEach(() => {
        complianceEngine = new ComplianceEngine();
        riskEngine = new RiskEngine();
        evidenceEngine = new EvidenceEngine();
        evidenceEngine.clear();
    });

    describe('Government Providers', () => {
        test('GST Provider validates format', async () => {
            const provider = registry.getProvider('gst');
            const result = await provider.verify('27ABCDE1234F1Z5');
            expect(result.status).toBeDefined();
            expect(result.source).toBe('GST');
            expect(result.verified_at).toBeDefined();
        });

        test('GST Provider rejects invalid format', async () => {
            const provider = registry.getProvider('gst');
            const result = await provider.verify('INVALID');
            expect(result.status).toBe('FAILED');
        });

        test('Udyam Provider validates format', async () => {
            const provider = registry.getProvider('udyam');
            const result = await provider.verify('UDYAM-MH-18-00123');
            expect(result.status).toBeDefined();
            expect(result.source).toBe('UDYAM');
        });

        test('PAN Provider validates format', async () => {
            const provider = registry.getProvider('pan');
            const result = await provider.verify('AAACT1234F');
            expect(result.status).toBeDefined();
            expect(result.source).toBe('PAN');
        });

        test('Debarment Provider checks correctly', async () => {
            const provider = registry.getProvider('debarment');

            // Not debarred
            const cleanResult = await provider.verify('CLEANPAN123F');
            expect(cleanResult.data.debarred).toBe(false);

            // Debarred
            const debarredResult = await provider.verify('FRAUDCO123F');
            expect(debarredResult.data.debarred).toBe(true);
        });

        test('All providers return standard response shape', async () => {
            const providers = registry.getAllProviders();

            for (const p of providers) {
                const provider = registry.getProvider(p.key);
                if (provider) {
                    const result = await provider.verify('TEST123');
                    expect(result).toHaveProperty('status');
                    expect(result).toHaveProperty('source');
                    expect(result).toHaveProperty('verified_at');
                    expect(result).toHaveProperty('data');
                    expect(result).toHaveProperty('confidence');
                }
            }
        });
    });

    describe('Compliance Engine', () => {
        test('Runs full compliance check', async () => {
            const bidData = {
                extractedFields: {
                    gstin: '27ABCDE1234F1Z5',
                    pan: 'AAACT1234F',
                    udyam_number: 'UDYAM-MH-18-00123',
                    local_content_percentage: 55,
                    local_content_source_doc: 'Make_In_India_Declaration.pdf',
                    local_content_source_page: 1
                },
                tenderRequirements: {
                    min_local_content: 50,
                    oem_required: false,
                    mandatory_documents: ['GST Certificate', 'PAN Card']
                },
                documents: [
                    { category: 'GST Certificate' },
                    { category: 'PAN Card' }
                ]
            };

            const result = await complianceEngine.runCompliance('BID-001', bidData);

            expect(result.bid_id).toBe('BID-001');
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
            expect(result.risk_level).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
            expect(result.rule_results).toBeInstanceOf(Array);
            expect(result.rule_results.length).toBeGreaterThan(0);
            expect(result.evidence).toBeInstanceOf(Array);
        });

        test('Calculates score correctly with weights', async () => {
            const bidData = {
                extractedFields: {
                    gstin: '27ABCDE1234F1Z5',
                    pan: 'AAACT1234F',
                    local_content_percentage: 60
                },
                tenderRequirements: {
                    min_local_content: 50,
                    mandatory_documents: []
                },
                documents: []
            };

            const result = await complianceEngine.runCompliance('BID-002', bidData);

            // Should have score based on weights
            expect(result.score).toBeDefined();
            expect(typeof result.score).toBe('number');
        });

        test('Handles LOCAL_CONTENT rule correctly', async () => {
            // Test PASS case
            const passData = {
                extractedFields: { local_content_percentage: 55 },
                tenderRequirements: { min_local_content: 50 },
                documents: []
            };
            const passResult = await complianceEngine.runCompliance('BID-PASS', passData);
            const lcPass = passResult.rule_results.find(r => r.rule_id === 'REQ-LC-01');
            expect(lcPass.result).toBe('PASS');

            // Test FAIL case
            const failData = {
                extractedFields: { local_content_percentage: 42 },
                tenderRequirements: { min_local_content: 50 },
                documents: []
            };
            const failResult = await complianceEngine.runCompliance('BID-FAIL', failData);
            const lcFail = failResult.rule_results.find(r => r.rule_id === 'REQ-LC-01');
            expect(lcFail.result).toBe('FAIL');
            expect(lcFail.actual).toBe('42%');
            expect(lcFail.expected).toBe('>= 50%');
        });

        test('Handles DEBARMENT rule with CRITICAL severity', async () => {
            const bidData = {
                extractedFields: {
                    pan: 'FRAUDCO123F', // Known debarred entity
                    gstin: '27FRAUDCO123F1Z5'
                },
                tenderRequirements: { mandatory_documents: [] },
                documents: []
            };

            const result = await complianceEngine.runCompliance('BID-DEBARRED', bidData);
            const debRule = result.rule_results.find(r => r.rule_id === 'REQ-DEB-01');

            expect(debRule.result).toBe('FAIL');
            expect(debRule.severity).toBe('CRITICAL');
            expect(debRule.details.data.debarred).toBe(true);
        });

        test('Updates weights correctly', () => {
            complianceEngine.updateWeights({ GST: 20, PAN: 20 });
            expect(complianceEngine.ruleWeights.GST).toBe(20);
            expect(complianceEngine.ruleWeights.PAN).toBe(20);
        });
    });

    describe('Risk Engine', () => {
        test('Calculates risk level from score', () => {
            expect(riskEngine.getRiskLevel(95)).toBe('LOW');
            expect(riskEngine.getRiskLevel(80)).toBe('MEDIUM');
            expect(riskEngine.getRiskLevel(60)).toBe('HIGH');
            expect(riskEngine.getRiskLevel(30)).toBe('CRITICAL');
        });

        test('Generates risk drivers from failed rules', () => {
            const mockComplianceResult = {
                score: 65,
                rule_results: [
                    { rule_id: 'REQ-LC-01', result: 'FAIL', severity: 'HIGH', weight: 15, source: 'LOCAL_CONTENT' },
                    { rule_id: 'REQ-GST-01', result: 'PASS', severity: 'HIGH', weight: 10, source: 'GST' },
                    { rule_id: 'REQ-OEM-01', result: 'FAIL', severity: 'HIGH', weight: 15, source: 'OEM' }
                ]
            };

            const riskResult = riskEngine.calculateRisk('BID-001', mockComplianceResult);

            expect(riskResult.risk_level).toBe('HIGH');
            expect(riskResult.risk_drivers).toBeInstanceOf(Array);
            expect(riskResult.risk_drivers.length).toBeGreaterThan(0);

            const lcDriver = riskResult.risk_drivers.find(d => d.factor === 'Tender Compliance');
            expect(lcDriver).toBeDefined();
            expect(lcDriver.severity).toBe('HIGH');
        });

        test('Provides factor breakdown', () => {
            const mockComplianceResult = {
                score: 75,
                rule_results: [
                    { rule_id: 'REQ-GST-01', result: 'PASS', source: 'GST' },
                    { rule_id: 'REQ-PAN-01', result: 'PASS', source: 'PAN' },
                    { rule_id: 'REQ-LC-01', result: 'FAIL', source: 'LOCAL_CONTENT' }
                ]
            };

            const riskResult = riskEngine.calculateRisk('BID-001', mockComplianceResult);

            expect(riskResult.factor_breakdown).toBeDefined();
            expect(riskResult.factor_breakdown['Statutory Compliance'].passed).toBe(1);
            expect(riskResult.factor_breakdown['Identity Consistency'].passed).toBe(1);
            expect(riskResult.factor_breakdown['Tender Compliance'].failed).toBe(1);
        });
    });

    describe('Evidence Engine', () => {
        test('Creates evidence record', () => {
            const evidence = evidenceEngine.createEvidence({
                requirement_id: 'REQ-LC-01',
                document_id: 'DOC-001',
                page_number: 1,
                extracted_value: '42%',
                expected_value: '>= 50%',
                actual_value: '42%',
                verification_source: 'LOCAL_CONTENT',
                rule_id: 'REQ-LC-01',
                result: 'FAIL',
                confidence: 0.98
            });

            expect(evidence.id).toBeDefined();
            expect(evidence.requirement_id).toBe('REQ-LC-01');
            expect(evidence.result).toBe('FAIL');
            expect(evidence.confidence).toBe(0.98);
            expect(evidence.hash).toBeDefined();
        });

        test('Creates evidence from rule results', () => {
            const ruleResults = [
                {
                    rule_id: 'REQ-GST-01',
                    result: 'PASS',
                    confidence: 0.99,
                    expected: 'VERIFIED',
                    actual: 'VERIFIED',
                    source: 'GST',
                    evidence_ref: 'GOV-GST-123',
                    details: { source: 'GST', data: { status: 'ACTIVE' } }
                },
                {
                    rule_id: 'REQ-LC-01',
                    result: 'FAIL',
                    confidence: 0.98,
                    expected: '>= 50%',
                    actual: '42%',
                    source: 'LOCAL_CONTENT',
                    evidence_ref: 'LC-456',
                    details: { required_percentage: 50, actual_percentage: 42 }
                }
            ];

            const evidence = evidenceEngine.createEvidenceFromRules(ruleResults, {}, {}, []);

            expect(evidence.length).toBe(2);
            expect(evidence[0].requirement_id).toBe('REQ-GST-01');
            expect(evidence[1].requirement_id).toBe('REQ-LC-01');
        });

        test('Retrieves evidence by bid', () => {
            evidenceEngine.createEvidence({
                requirement_id: 'REQ-001',
                document_id: 'DOC-001',
                page_number: 1,
                extracted_value: 'test',
                expected_value: 'test',
                actual_value: 'test',
                verification_source: 'GST',
                rule_id: 'REQ-001',
                result: 'PASS',
                confidence: 1.0,
                details: { bid_id: 'BID-001' }
            });

            const bidEvidence = evidenceEngine.getEvidenceForBid('BID-001');
            expect(bidEvidence.length).toBe(1);
        });

        test('Adds manual override evidence', () => {
            const evidence = evidenceEngine.addOverrideEvidence({
                officer_id: 'OFF-001',
                original_result: 'FAIL',
                new_result: 'PASS',
                reason: 'Document clarification provided',
                requirement_id: 'REQ-LC-01',
                rule_id: 'REQ-LC-01'
            });

            expect(evidence.verification_source).toBe('MANUAL_OVERRIDE');
            expect(evidence.details.officer_id).toBe('OFF-001');
            expect(evidence.details.original_result).toBe('FAIL');
            expect(evidence.details.new_result).toBe('PASS');
            expect(evidence.details.override).toBe(true);
        });

        test('Exports evidence for audit', () => {
            evidenceEngine.createEvidence({
                requirement_id: 'REQ-001',
                document_id: 'DOC-001',
                page_number: 1,
                extracted_value: 'test',
                expected_value: 'test',
                actual_value: 'test',
                verification_source: 'GST',
                rule_id: 'REQ-001',
                result: 'PASS',
                confidence: 1.0,
                details: { bid_id: 'BID-001' }
            });

            const audit = evidenceEngine.exportForAudit('BID-001');

            expect(audit.bid_id).toBe('BID-001');
            expect(audit.total_records).toBe(1);
            expect(audit.records[0].requirement_id).toBe('REQ-001');
            expect(audit.records[0].hash).toBeDefined();
        });
    });

    describe('Integration: Full Pipeline', () => {
        test('Complete verification -> compliance -> risk -> evidence flow', async () => {
            // Simulate a realistic bid with mixed results
            const bidData = {
                extractedFields: {
                    gstin: '27ABCDE1234F1Z5',      // Valid
                    pan: 'AAACT1234F',            // Valid
                    udyam_number: 'UDYAM-MH-18-00123', // Valid
                    local_content_percentage: 42, // FAIL - below 50%
                    local_content_source_doc: 'Make_In_India_Declaration.pdf',
                    local_content_source_page: 1,
                    oem_certificate: 'OEM12345678' // Will be checked
                },
                tenderRequirements: {
                    min_local_content: 50,
                    oem_required: true,
                    mandatory_documents: ['GST Certificate', 'PAN Card', 'OEM Cert']
                },
                documents: [
                    { category: 'GST Certificate' },
                    { category: 'PAN Card' },
                    { category: 'OEM Cert' }
                ]
            };

            // Run compliance
            const complianceResult = await complianceEngine.runCompliance('BID-INTEGRATION-001', bidData);

            // Verify compliance result structure
            expect(complianceResult.score).toBeLessThan(100); // Should not be perfect due to local content fail
            expect(complianceResult.failed_count).toBeGreaterThan(0);

            // Run risk
            const riskResult = riskEngine.calculateRisk('BID-INTEGRATION-001', complianceResult);
            expect(riskResult.risk_level).toMatch(/^(MEDIUM|HIGH|CRITICAL)$/);
            expect(riskResult.risk_drivers.length).toBeGreaterThan(0);

            // Generate evidence
            const evidence = evidenceEngine.createEvidenceFromRules(
                complianceResult.rule_results,
                bidData.verificationResults || {},
                bidData.extractedFields || {},
                bidData.documents || []
            );

            expect(evidence.length).toBeGreaterThan(0);

            // Check evidence for failed local content rule
            const lcEvidence = evidence.find(e => e.requirement_id === 'REQ-LC-01');
            expect(lcEvidence).toBeDefined();
            expect(lcEvidence.result).toBe('FAIL');
            expect(lcEvidence.extracted_value).toBe('42%');
            expect(lcEvidence.expected_value).toBe('>= 50%');
        });
    });
});