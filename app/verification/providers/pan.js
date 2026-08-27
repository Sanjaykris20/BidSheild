/**
 * PAN Provider - Verifies PAN against NSDL/Income Tax Portal
 * Module 5: Government Verification - PANProvider
 */

const VerificationProvider = require('./base');

class PANProvider extends VerificationProvider {
    constructor(config = {}) {
        super({
            name: 'NSDL PAN Verification',
            source: 'PAN',
            environment: config.environment || 'MOCK',
            credentials: config.credentials || {},
            timeout: config.timeout || 5000
        });

        // PAN format: AAAAA9999A
        this.panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    }

    async verify(pan, context = {}) {
        if (!this.validateFormat(pan)) {
            return {
                status: 'FAILED',
                source: 'PAN',
                verified_at: new Date().toISOString(),
                data: { error: 'Invalid PAN format', pan },
                confidence: 0,
                latency_ms: 0
            };
        }

        return super.verify(pan.toUpperCase(), context);
    }

    validateFormat(pan) {
        return this.panRegex.test(pan.toUpperCase());
    }

    generateMockData(pan) {
        const panUpper = pan.toUpperCase();
        // Deterministic: 5th char determines type (P=Individual, C=Company, etc.)
        const typeChar = panUpper[4];
        const isCompany = typeChar === 'C';
        const isValid = panUpper.length === 10;

        const types = {
            'P': 'Individual', 'C': 'Company', 'H': 'HUF',
            'F': 'Firm', 'A': 'AOP', 'T': 'Trust', 'B': 'BOI',
            'L': 'Local Authority', 'J': 'Artificial Juridical', 'G': 'Government'
        };

        return {
            valid: isValid,
            data: {
                pan: panUpper,
                name: isValid ? (isCompany ? 'TECHCORP SOLUTIONS PRIVATE LIMITED' : 'JOHN DOE') : null,
                category: isValid ? types[typeChar] || 'Unknown' : null,
                status: isValid ? 'ACTIVE' : 'INVALID',
                aadhaar_linked: isValid,
                address: isValid ? {
                    flat: 'Plot 44',
                    building: 'Electronic City Phase II',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    pincode: '560100'
                } : null
            },
            confidence: isValid ? 0.99 : 0.1
        };
    }

    async performVerification(pan, context) {
        // In production, integrate with NSDL PAN API
        // Requires NSDL API subscription
        return this.generateMockData(pan);
    }
}

module.exports = PANProvider;