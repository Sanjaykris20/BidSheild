/**
 * OEM Provider - Verifies OEM Authorization Certificates
 * Module 5: Government Verification - OEMProvider
 */

const VerificationProvider = require('./base');

class OEMProvider extends VerificationProvider {
    constructor(config = {}) {
        super({
            name: 'OEM Authorization Registry',
            source: 'OEM',
            environment: config.environment || 'MOCK',
            credentials: config.credentials || {},
            timeout: config.timeout || 5000
        });
    }

    async verify(identifier, context = {}) {
        // Identifier is OEM certificate number
        const certNumber = identifier.toUpperCase();

        if (!/^OEM[0-9]{8,}$/.test(certNumber)) {
            return {
                status: 'FAILED',
                source: 'OEM',
                verified_at: new Date().toISOString(),
                data: { error: 'Invalid OEM certificate format', oem_certificate: certNumber },
                confidence: 0,
                latency_ms: 0
            };
        }

        return super.verify(certNumber, context);
    }

    generateMockData(certNumber) {
        const hash = this.simpleHash(certNumber);
        const isValid = (hash % 100) > 15; // 85% valid

        const oems = [
            'Dell Technologies', 'HP Inc.', 'Lenovo', 'Cisco Systems',
            'HPE', 'IBM', 'Microsoft', 'VMware', 'Fortinet', 'Palo Alto Networks'
        ];

        const products = [
            'Servers', 'Storage', 'Networking', 'Security Appliances',
            'Workstations', 'Laptops', 'Software Licenses', 'Cloud Infrastructure'
        ];

        return {
            valid: isValid,
            data: {
                oem_certificate_number: certNumber,
                oem_name: isValid ? oems[hash % oems.length] : null,
                authorized_partner: isValid ? 'TECHCORP SOLUTIONS PRIVATE LIMITED' : null,
                partner_type: isValid ? 'Authorized Reseller' : null,
                authorization_date: isValid ? '2023-04-01' : null,
                expiry_date: isValid ? '2026-03-31' : null,
                status: isValid ? 'ACTIVE' : 'EXPIRED',
                products_authorized: isValid ? products.slice(0, 3 + (hash % 3)) : [],
                territory: isValid ? 'India - South Region' : null,
                certificate_type: isValid ? 'Gold Partner' : null,
                verification_url: isValid ? `https://oem-verify.example.com/${certNumber}` : null
            },
            confidence: isValid ? 0.96 : 0.1
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

    async performVerification(certNumber, context) {
        // In production, integrate with OEM partner portals
        // Each OEM has different API; this would be a registry
        return this.generateMockData(certNumber);
    }
}

module.exports = OEMProvider;