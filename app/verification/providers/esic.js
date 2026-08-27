/**
 * ESIC Provider - Verifies ESI Registration and Compliance
 * Module 5: Government Verification - ESICProvider
 */

const VerificationProvider = require('./base');

class ESICProvider extends VerificationProvider {
    constructor(config = {}) {
        super({
            name: 'ESIC Portal',
            source: 'ESIC',
            environment: config.environment || 'MOCK',
            credentials: config.credentials || {},
            timeout: config.timeout || 8000
        });
    }

    async verify(identifier, context = {}) {
        // Identifier is ESI code (e.g., 42000123450000699)
        const esiCode = identifier.toString();

        if (!/^[0-9]{17}$/.test(esiCode)) {
            return {
                status: 'FAILED',
                source: 'ESIC',
                verified_at: new Date().toISOString(),
                data: { error: 'Invalid ESI code format', esi_code: esiCode },
                confidence: 0,
                latency_ms: 0
            };
        }

        return super.verify(esiCode, context);
    }

    generateMockData(esiCode) {
        const hash = this.simpleHash(esiCode);
        const isCompliant = (hash % 100) > 25; // 75% compliant

        return {
            valid: isCompliant,
            data: {
                esi_code: esiCode,
                employer_name: isCompliant ? 'TECHCORP SOLUTIONS PRIVATE LIMITED' : null,
                address: isCompliant ? {
                    building: 'Plot 44',
                    street: 'Electronic City Phase II',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    pincode: '560100'
                } : null,
                registration_date: '2018-07-01',
                status: isCompliant ? 'ACTIVE' : 'NON_COMPLIANT',
                covered_employees: isCompliant ? 38 : 0,
                contribution_status: isCompliant ? 'REGULAR' : 'DEFAULT',
                last_contribution_month: isCompliant ? '2026-07' : '2026-02',
                arrears: isCompliant ? 0 : 85000,
                compliance_status: isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT'
            },
            confidence: isCompliant ? 0.9 : 0.8
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

    async performVerification(esiCode, context) {
        // In production, integrate with ESIC API
        return this.generateMockData(esiCode);
    }
}

module.exports = ESICProvider;