/**
 * GST Provider - Verifies GSTIN against GSTN Portal
 * Module 5: Government Verification - GSTProvider
 */

const VerificationProvider = require('./base');

class GSTProvider extends VerificationProvider {
    constructor(config = {}) {
        super({
            name: 'GSTN Portal API',
            source: 'GST',
            environment: config.environment || 'MOCK',
            credentials: config.credentials || {},
            timeout: config.timeout || 5000
        });

        // GSTIN format validation regex
        this.gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    }

    /**
     * Verify GSTIN
     * @param {string} gstin - 15-character GSTIN
     * @param {object} context - Additional context
     * @returns {Promise<object>} Standard Verification Response
     */
    async verify(gstin, context = {}) {
        // Validate format first
        if (!this.validateFormat(gstin)) {
            return {
                status: 'FAILED',
                source: 'GST',
                verified_at: new Date().toISOString(),
                data: { error: 'Invalid GSTIN format', gstin },
                confidence: 0,
                latency_ms: 0
            };
        }

        return super.verify(gstin.toUpperCase(), context);
    }

    /**
     * Validate GSTIN format
     * @param {string} gstin
     * @returns {boolean}
     */
    validateFormat(gstin) {
        return this.gstinRegex.test(gstin.toUpperCase());
    }

    /**
     * Generate mock GST data
     * @param {string} gstin
     * @returns {object}
     */
    generateMockData(gstin) {
        const stateCode = gstin.substring(0, 2);
        const pan = gstin.substring(2, 12);
        const entityCode = gstin.substring(12, 13);
        const checksum = gstin.substring(13, 15);

        // Deterministic validation based on checksum
        const isValid = this.calculateChecksum(gstin.substring(0, 14)) === checksum;

        const states = {
            '27': 'Maharashtra', '29': 'Karnataka', '36': 'Telangana',
            '07': 'Delhi', '09': 'Uttar Pradesh', '33': 'Tamil Nadu',
            '19': 'West Bengal', '24': 'Gujarat'
        };

        return {
            valid: isValid,
            data: {
                gstin: gstin.toUpperCase(),
                legal_name: isValid ? 'TECHCORP SOLUTIONS PRIVATE LIMITED' : null,
                trade_name: isValid ? 'TechCorp Solutions' : null,
                state: states[stateCode] || 'Unknown',
                registration_type: 'Regular',
                status: isValid ? 'ACTIVE' : 'INVALID',
                registration_date: '2018-07-01',
                cancellation_date: null,
                taxpayer_type: 'Regular',
                address: {
                    building: 'Plot 44',
                    street: 'Electronic City Phase II',
                    city: 'Bangalore',
                    state: states[stateCode] || 'Karnataka',
                    pincode: '560100'
                }
            },
            confidence: isValid ? 0.99 : 0.1
        };
    }

    /**
     * Calculate GSTIN checksum (Verhoeff algorithm simplified)
     * @param {string} gstin14 - First 14 characters
     * @returns {string} Checksum character
     */
    calculateChecksum(gstin14) {
        // Simplified deterministic checksum for demo
        let sum = 0;
        for (let i = 0; i < gstin14.length; i++) {
            const char = gstin14[i];
            const val = isNaN(char) ? char.charCodeAt(0) - 55 : parseInt(char);
            sum += val * (i + 1);
        }
        const checksumVal = sum % 36;
        return checksumVal < 10 ? String(checksumVal) : String.fromCharCode(55 + checksumVal);
    }

    /**
     * Perform actual GSTN API verification
     * @param {string} gstin
     * @param {object} context
     * @returns {Promise<object>}
     */
    async performVerification(gstin, context) {
        // In production, integrate with GSTN API
        // This requires:
        // 1. GSTN API credentials (client_id, client_secret)
        // 2. OTP-based authentication for taxpayer
        // 3. Call to /taxpayer/search endpoint

        // Example integration structure:
        /*
        const token = await this.getAccessToken();
        const response = await fetch(`https://api.gst.gov.in/taxpayer/search/${gstin}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`GSTN API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            status: data.status === 'Active' ? 'VERIFIED' : 'FAILED',
            data: data,
            confidence: 1.0
        };
        */

        // Fallback to mock for now
        return this.generateMockData(gstin);
    }
}

module.exports = GSTProvider;