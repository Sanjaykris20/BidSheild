/**
 * NSIC Provider - Verifies NSIC Registration (Single Point Registration)
 * Module 5: Government Verification - NSICProvider
 */

const VerificationProvider = require('./base');

class NSICProvider extends VerificationProvider {
    constructor(config = {}) {
        super({
            name: 'NSIC Single Point Registration',
            source: 'NSIC',
            environment: config.environment || 'MOCK',
            credentials: config.credentials || {},
            timeout: config.timeout || 5000
        });
    }

    async verify(identifier, context = {}) {
        // Identifier is NSIC registration number
        const nsicNumber = identifier.toUpperCase();

        if (!/^NSIC[0-9]{6,}$/.test(nsicNumber)) {
            return {
                status: 'FAILED',
                source: 'NSIC',
                verified_at: new Date().toISOString(),
                data: { error: 'Invalid NSIC registration number format', nsic_number: nsicNumber },
                confidence: 0,
                latency_ms: 0
            };
        }

        return super.verify(nsicNumber, context);
    }

    generateMockData(nsicNumber) {
        const hash = this.simpleHash(nsicNumber);
        const isRegistered = (hash % 100) > 40; // 60% registered

        const categories = [
            'Computer Hardware', 'Software Services', 'IT Infrastructure',
            'Network Equipment', 'Security Systems', 'Cloud Services'
        ];

        return {
            valid: isRegistered,
            data: {
                nsic_registration_number: nsicNumber,
                company_name: isRegistered ? 'TECHCORP SOLUTIONS PRIVATE LIMITED' : null,
                registration_date: isRegistered ? '2020-01-10' : null,
                validity_upto: isRegistered ? '2026-01-09' : null,
                status: isRegistered ? 'ACTIVE' : 'EXPIRED',
                category: isRegistered ? categories[hash % categories.length] : null,
                monetary_limit: isRegistered ? 5000000 : 0,
                udhyog_aadhaar: 'UDYAM-KA-18-00123',
                gstin: '29AAACT1234F1Z5',
                address: isRegistered ? {
                    building: 'Plot 44',
                    street: 'Electronic City Phase II',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    pincode: '560100'
                } : null
            },
            confidence: isRegistered ? 0.95 : 0.1
        };
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    async performVerification(nsicNumber, context) {
        // In production, integrate with NSIC API
        return this.generateMockData(nsicNumber);
    }
}

module.exports = NSICProvider;