/**
 * BidCompliance AI Platform - API Service Layer
 * Connects frontend to all backend services:
 * - Node.js Express (port 3000) - Verification, Compliance, Risk, Evidence, AI Proxy, Backend Proxy
 * - Python FastAPI (port 8000) - Tender/Bid management (proxied through Node)
 * - AI Engine (port 8001) - Document extraction, AI Copilot (proxied through Node)
 */

const API_BASE = {
    NODE: 'http://localhost:3000/api',
    PYTHON: 'http://localhost:3000/api/backend',
    AI: 'http://localhost:3000/api/ai'
};

class ApiService {
    constructor() {
        this.currentBidId = null;
        this.currentRole = null;
    }

    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.detail || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return data;
        } catch (error) {
            console.error(`API Error (${url}):`, error);
            throw error;
        }
    }

    // ============================================
    // HEALTH & STATUS
    // ============================================
    
    async checkAllHealth() {
        const [nodeHealth, pythonHealth, aiHealth] = await Promise.allSettled([
            this.request(`${API_BASE.NODE}/health`),
            this.request(`${API_BASE.PYTHON}/`),
            this.request(`${API_BASE.AI}/health`)
        ]);
        
        return {
            node: nodeHealth.status === 'fulfilled' ? nodeHealth.value : { status: 'ERROR', error: nodeHealth.reason?.message || 'Connection failed' },
            python: pythonHealth.status === 'fulfilled' ? pythonHealth.value : { status: 'ERROR', error: pythonHealth.reason?.message || 'Connection failed' },
            ai: aiHealth.status === 'fulfilled' ? aiHealth.value : { status: 'ERROR', error: aiHealth.reason?.message || 'Connection failed' }
        };
    }

    // ============================================
    // VERIFICATION ENGINE (Node.js - Port 3000)
    // ============================================
    
    async getProviderHealth() {
        return this.request(`${API_BASE.NODE}/verification/providers`);
    }

    async verifyGSTIN(gstin) {
        return this.request(`${API_BASE.NODE}/verification/gst`, {
            method: 'POST',
            body: JSON.stringify({ identifier: gstin, context: {} })
        });
    }

    async verifyUdyam(udyamNumber) {
        return this.request(`${API_BASE.NODE}/verification/udyam`, {
            method: 'POST',
            body: JSON.stringify({ identifier: udyamNumber, context: {} })
        });
    }

    async verifyPAN(pan) {
        return this.request(`${API_BASE.NODE}/verification/pan`, {
            method: 'POST',
            body: JSON.stringify({ identifier: pan, context: {} })
        });
    }

    async verifyOEM(oemCertificate) {
        return this.request(`${API_BASE.NODE}/verification/oem`, {
            method: 'POST',
            body: JSON.stringify({ identifier: oemCertificate, context: {} })
        });
    }

    async checkDebarment(identifier, context = {}) {
        return this.request(`${API_BASE.NODE}/verification/debarment`, {
            method: 'POST',
            body: JSON.stringify({ identifier, context })
        });
    }

    async runFullVerification(bidId, bidData) {
        return this.request(`${API_BASE.NODE}/verification/run/${bidId}`, {
            method: 'POST',
            body: JSON.stringify({ bid_id: bidId, bid_data: bidData })
        });
    }

    async setProviderEnvironment(providerKey, environment) {
        return this.request(`${API_BASE.NODE}/verification/providers/${providerKey}/environment`, {
            method: 'POST',
            body: JSON.stringify({ environment })
        });
    }

    // ============================================
    // COMPLIANCE ENGINE (Node.js - Port 3000)
    // ============================================
    
    async runCompliance(bidId, bidData) {
        return this.request(`${API_BASE.NODE}/compliance/run/${bidId}`, {
            method: 'POST',
            body: JSON.stringify({ bid_id: bidId, bid_data: bidData })
        });
    }

    async getComplianceResult(bidId) {
        return this.request(`${API_BASE.NODE}/compliance/${bidId}`);
    }

    async getComplianceSummary(bidId) {
        return this.request(`${API_BASE.NODE}/compliance/${bidId}/summary`);
    }

    async getFailedRules(bidId) {
        return this.request(`${API_BASE.NODE}/compliance/${bidId}/failed`);
    }

    async getRuleWeights() {
        return this.request(`${API_BASE.NODE}/compliance/weights`);
    }

    async updateRuleWeights(weights) {
        return this.request(`${API_BASE.NODE}/compliance/weights`, {
            method: 'PUT',
            body: JSON.stringify(weights)
        });
    }

    // ============================================
    // RISK ENGINE (Node.js - Port 3000)
    // ============================================
    
    async calculateRisk(bidId, complianceResult) {
        return this.request(`${API_BASE.NODE}/risk/calculate/${bidId}`, {
            method: 'POST',
            body: JSON.stringify({ bid_id: bidId, compliance_result: complianceResult })
        });
    }

    async getRiskAnalysis(bidId) {
        return this.request(`${API_BASE.NODE}/risk/${bidId}`);
    }

    async getRiskThresholds() {
        return this.request(`${API_BASE.NODE}/risk/thresholds`);
    }

    async updateRiskThresholds(thresholds) {
        return this.request(`${API_BASE.NODE}/risk/thresholds`, {
            method: 'PUT',
            body: JSON.stringify(thresholds)
        });
    }

    async getFactorWeights() {
        return this.request(`${API_BASE.NODE}/risk/factor-weights`);
    }

    async updateFactorWeights(weights) {
        return this.request(`${API_BASE.NODE}/risk/factor-weights`, {
            method: 'PUT',
            body: JSON.stringify(weights)
        });
    }

    // ============================================
    // EVIDENCE ENGINE (Node.js - Port 3000)
    // ============================================
    
    async getEvidence(evidenceId) {
        return this.request(`${API_BASE.NODE}/evidence/${evidenceId}`);
    }

    async getEvidenceForBid(bidId) {
        return this.request(`${API_BASE.NODE}/evidence/bids/${bidId}/evidence`);
    }

    async getEvidenceSummary(bidId) {
        return this.request(`${API_BASE.NODE}/evidence/bids/${bidId}/evidence/summary`);
    }

    async exportEvidenceForAudit(bidId) {
        return this.request(`${API_BASE.NODE}/evidence/bids/${bidId}/evidence/export`);
    }

    async addOverrideEvidence(params) {
        return this.request(`${API_BASE.NODE}/evidence/override`, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    async getEvidenceByRequirement(requirementId) {
        return this.request(`${API_BASE.NODE}/evidence/requirement/${requirementId}`);
    }

    // ============================================
    // AI ENGINE (Proxied through Node - Port 8001)
    // ============================================
    
    async extractDocument(file, documentType = 'auto') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', documentType);
        
        const response = await fetch(`${API_BASE.AI}/document-extract`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || data.detail || `HTTP ${response.status}`);
        }
        
        // Normalize response format - AI engine returns extracted_fields
        if (!data.extracted_fields && data.extracted_data) {
            data.extracted_fields = data.extracted_data;
        }
        data.extracted_data = data.extracted_fields || {};
        
        return data;
    }

    async analyzeTender(tenderText) {
        return this.request(`${API_BASE.AI}/tender-analyze`, {
            method: 'POST',
            body: JSON.stringify({ tender_text: tenderText })
        });
    }

    async askCopilot(query, context = {}) {
        return this.request(`${API_BASE.AI}/copilot`, {
            method: 'POST',
            body: JSON.stringify({ query, context })
        });
    }

    async getAIHealth() {
        return this.request(`${API_BASE.AI}/health`);
    }

    // ============================================
    // PYTHON BACKEND (Proxied through Node - Port 8000)
    // ============================================
    
    async getTenders(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`${API_BASE.PYTHON}/tenders${query ? '?'+query : ''}`);
    }

    async getTender(tenderId) {
        return this.request(`${API_BASE.PYTHON}/tenders/${tenderId}`);
    }

    async createTender(tenderData) {
        return this.request(`${API_BASE.PYTHON}/tenders`, {
            method: 'POST',
            body: JSON.stringify(tenderData)
        });
    }

    async getBids(tenderId) {
        return this.request(`${API_BASE.PYTHON}/tenders/${tenderId}/bids`);
    }

    async submitBid(tenderId, bidData) {
        return this.request(`${API_BASE.PYTHON}/tenders/${tenderId}/bids`, {
            method: 'POST',
            body: JSON.stringify(bidData)
        });
    }

    async getBid(bidId) {
        return this.request(`${API_BASE.PYTHON}/bids/${bidId}`);
    }

    async updateBidStatus(bidId, status, remarks) {
        return this.request(`${API_BASE.PYTHON}/bids/${bidId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, remarks })
        });
    }

    async getDashboardStats(role) {
        return this.request(`${API_BASE.PYTHON}/dashboard/stats?role=${role}`);
    }

    // ============================================
    // UTILITY: Demo Bid Data Generator
    // ============================================
    
    generateDemoBidData(overrides = {}) {
        return {
            extractedFields: {
                gstin: '27ABCDE1234F1Z5',
                udyam_number: 'UDYAM-MH-18-00123',
                pan: 'AAACT1234F',
                pan_number: 'AAACT1234F',
                establishment_code: 'MH/BAN/12345',
                esi_code: 'ESI/BAN/67890',
                dipp_number: 'DIPP12345',
                nsic_number: 'NSIC/MH/12345',
                oem_certificate: 'OEM-CERT-2024-001',
                digilocker_doc_id: 'DL-2024-001234',
                local_content_percentage: 42,
                local_content_source_doc: 'Make_In_India_Declaration.pdf',
                local_content_source_page: 1,
                oem_source_page: 1,
                ...overrides.extractedFields
            },
            documents: [
                { id: 'doc-1', category: 'GST_CERTIFICATE', name: 'GST_Certificate_Maharashtra.pdf' },
                { id: 'doc-2', category: 'UDYAM_REGISTRATION', name: 'Udyam_Registration_2024.jpg' },
                { id: 'doc-3', category: 'PAN_CARD', name: 'PAN_Card.pdf' },
                { id: 'doc-4', category: 'MAKE_IN_INDIA', name: 'Make_In_India_Declaration.pdf' },
                { id: 'doc-5', category: 'OEM_AUTHORIZATION', name: 'OEM_Authorization.pdf' },
                ...(overrides.documents || [])
            ],
            tenderRequirements: {
                min_local_content: 50,
                mandatory_documents: ['GST_CERTIFICATE', 'UDYAM_REGISTRATION', 'PAN_CARD', 'MAKE_IN_INDIA'],
                oem_required: true,
                ...overrides.tenderRequirements
            },
            context: {
                tender_id: 'GEM/2026/B/1024',
                bidder_name: 'TechCorp Solutions Pvt Ltd',
                ...overrides.context
            }
        };
    }
}

// Export singleton
window.ApiService = new ApiService();
window.API_BASE = API_BASE;