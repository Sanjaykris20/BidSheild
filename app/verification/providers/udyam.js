/**
 * Udyam Provider - Verifies Udyam Registration against MSME Portal
 * Module 5: Government Verification - UdyamProvider
 */

const VerificationProvider = require('./base');

class UdyamProvider extends VerificationProvider {
    constructor(config = {}) {
        super({
            name: 'Udyam Registration Portal',
            source: 'UDYAM',
            environment: config.environment || 'MOCK',
            credentials: config.credentials || {},
            timeout: config.timeout || 5000
        });

        // Udyam format: UDYAM-XX-XX-XXXXXX
        this.udyamRegex = /^UDYAM-[0-9]{2}-[0-9]{2}-[0-9]{6,7}$/i;
    }

    /**
     * Verify Udyam Registration Number
     * @param {string} udyamNumber
     * @param {object} context
     * @returns {Promise<object>}
     */
    async verify(udyamNumber, context = {}) {
        if (!this.validateFormat(udyamNumber)) {
            return {
                status: 'FAILED',
                source: 'UDYAM',
                verified_at: new Date().toISOString(),
                data: { error: 'Invalid Udyam format', udyam_number: udyamNumber },
                confidence: 0,
                latency_ms: 0
            };
        }

        return super.verify(udyamNumber.toUpperCase(), context);
    }

    validateFormat(udyamNumber) {
        return this.udyamRegex.test(udyamNumber.toUpperCase());
    }

    generateMockData(udyamNumber) {
        // Parse components: UDYAM-STATE-DISTRICT-SEQUENCE
        const parts = udyamNumber.toUpperCase().split('-');
        const stateCode = parts[1];
        const districtCode = parts[2];

        const states = {
            'MH': 'Maharashtra', 'KA': 'Karnataka', 'TG': 'Telangana',
            'DL': 'Delhi', 'UP': 'Uttar Pradesh', 'TN': 'Tamil Nadu',
            'WB': 'West Bengal', 'GJ': 'Gujarat'
        };

        // Deterministic validation
        const sequence = parseInt(parts[3]);
        const isValid = sequence > 0 && sequence < 999999;

        return {
            valid: isValid,
            data: {
                udyam_number: udyamNumber.toUpperCase(),
                enterprise_name: isValid ? 'TECHCORP SOLUTIONS PRIVATE LIMITED' : null,
                type_of_enterprise: isValid ? 'Micro' : null,
                major_activity: isValid ? 'Services' : null,
                nic_codes: isValid ? ['62011', '62099'] : [],
                date_of_registration: isValid ? '2022-01-15' : null,
                status: isValid ? 'ACTIVE' : 'INVALID',
                pan: 'AAACT1234F',
                gstin: ['27AAACT1234F1Z5'],
                address: {
                    flat: 'Plot 44',
                    building: 'Electronic City',
                    village_town: 'Bangalore',
                    district: 'Bangalore Urban',
                    state: states[stateCode] || 'Karnataka',
                    pincode: '560100'
                },
                investment_in_plant_machinery: 4500000,
                turnover: 12000000,
                employees: 25
            },
            confidence: isValid ? 0.98 : 0.1
        };
    }

    async performVerification(udyamNumber, context) {
        // In production, integrate with Udyam API
        // Requires MSME API access
        return this.generateMockData(udyamNumber);
    }
}

module.exports = UdyamProvider;