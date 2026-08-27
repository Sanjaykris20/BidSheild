/**
 * Startup India Provider - Verifies DPIIT Recognition
 * Module 5: Government Verification - StartupProvider
 */

const VerificationProvider = require('./base');

class StartupProvider extends VerificationProvider {
    constructor(config = {}) {
        super({
            name: 'Startup India Portal (DPIIT)',
            source: 'STARTUP',
            environment: config.environment || 'MOCK',
            credentials: config.credentials || {},
            timeout: config.timeout || 5000
        });
    }

    async verify(identifier, context = {}) {
        // Identifier is DPIIT recognition number (e.g., DIPP12345)
        const dippNumber = identifier.toUpperCase();

        if (!/^DIPP[0-9]{5,}$/.test(dippNumber)) {
            return {
                status: 'FAILED',
                source: 'STARTUP',
                verified_at: new Date().toISOString(),
                data: { error: 'Invalid DPIIT recognition number format', dipp_number: dippNumber },
                confidence: 0,
                latency_ms: 0
            };
        }

        return super.verify(dippNumber, context);
    }

    generateMockData(dippNumber) {
        const hash = this.simpleHash(dippNumber);
        const isRecognized = (hash % 100) > 30; // 70% recognized

        const sectors = [
            'IT Services', 'FinTech', 'EdTech', 'HealthTech',
            'AgriTech', 'SaaS', 'AI/ML', 'IoT', 'Blockchain'
        ];

        return {
            valid: isRecognized,
            data: {
                dipp_number: dippNumber,
                entity_name: isRecognized ? 'TECHCORP SOLUTIONS PRIVATE LIMITED' : null,
                recognition_date: isRecognized ? '2021-03-15' : null,
                status: isRecognized ? 'RECOGNIZED' : 'NOT_RECOGNIZED',
                sector: isRecognized ? sectors[hash % sectors.length] : null,
                stage: isRecognized ? 'Early Stage' : null,
                incorporation_number: 'U72900KA2018PTC123456',
                pan: 'AAACT1234F',
                website: isRecognized ? 'https://techcorp.example.com' : null,
                email: isRecognized ? 'contact@techcorp.example.com' : null,
                authorized_representative: isRecognized ? 'John Doe' : null,
                benefits_availed: isRecognized ? ['Tax Exemption u/s 80-IAC', 'IPR Fast-track'] : []
            },
            confidence: isRecognized ? 0.97 : 0.1
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

    async performVerification(dippNumber, context) {
        // In production, integrate with Startup India API
        return this.generateMockData(dippNumber);
    }
}

module.exports = StartupProvider;