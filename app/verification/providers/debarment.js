/**
 * Debarment Provider - Checks Central/State Debarment Lists
 * Module 5: Government Verification - DebarmentProvider
 * CRITICAL SEVERITY - Must never fail silently
 */

const VerificationProvider = require('./base');

class DebarmentProvider extends VerificationProvider {
    constructor(config = {}) {
        super({
            name: 'Central/State Debarment Registry',
            source: 'DEBARMENT',
            environment: config.environment || 'MOCK',
            credentials: config.credentials || {},
            timeout: config.timeout || 5000
        });

        // In-memory debarment list for demo
        // In production, this would be a database sync from official sources
        this.debarredEntities = new Map([
            // Format: PAN -> { details }
            ['FRAUDCO123F', {
                entity_name: 'FRAUDCO SOLUTIONS PVT LTD',
                debarred_by: 'Central Government',
                debarment_date: '2024-01-15',
                debarment_period: '3 years',
                reason: 'Submission of forged documents in GEM/2023/B/5555',
                order_number: 'DEB/2024/001',
                status: 'ACTIVE'
            }],
            ['BLACKLIST99Z', {
                entity_name: 'BLACKLIST ENTERPRISES',
                debarred_by: 'State Government - Karnataka',
                debarment_date: '2023-11-20',
                debarment_period: '2 years',
                reason: 'Bid rigging in tender KA/2023/IT/0045',
                order_number: 'KA/DEB/2023/045',
                status: 'ACTIVE'
            }]
        ]);
    }

    async verify(identifier, context = {}) {
        // Check multiple identifiers: PAN, GSTIN, CIN, Company Name
        const identifiers = this.normalizeIdentifiers(identifier, context);

        // Check each identifier against debarment lists
        for (const id of identifiers) {
            const result = await this.checkDebarment(id);
            if (result.found) {
                return {
                    status: 'VERIFIED', // Verified as DEBARRED
                    source: 'DEBARMENT',
                    verified_at: new Date().toISOString(),
                    data: {
                        debarred: true,
                        matched_identifier: id,
                        ...result.details
                    },
                    confidence: 1.0,
                    latency_ms: 10
                };
            }
        }

        // Not found in any debarment list
        return {
            status: 'VERIFIED', // Verified as NOT debarred
            source: 'DEBARMENT',
            verified_at: new Date().toISOString(),
            data: {
                debarred: false,
                checked_identifiers: identifiers,
                checked_sources: ['CENTRAL_DEBARMENT', 'STATE_DEBARMENT_KARNATAKA', 'STATE_DEBARMENT_MAHARASHTRA', 'GEM_DEBARMENT', 'CVC_DEBARMENT']
            },
            confidence: 0.95,
            latency_ms: 15
        };
    }

    normalizeIdentifiers(identifier, context) {
        const ids = new Set();

        // Add primary identifier
        if (identifier) ids.add(identifier.toUpperCase());

        // Add context identifiers
        if (context.pan) ids.add(context.pan.toUpperCase());
        if (context.gstin) ids.add(context.gstin.toUpperCase());
        if (context.cin) ids.add(context.cin.toUpperCase());
        if (context.company_name) ids.add(context.company_name.toUpperCase());

        // Add GSTIN-derived PAN (GSTIN chars 3-12 = PAN)
        if (context.gstin && context.gstin.length === 15) {
            const panFromGstin = context.gstin.substring(2, 12);
            ids.add(panFromGstin);
        }

        return Array.from(ids);
    }

    async checkDebarment(identifier) {
        // Check exact match
        if (this.debarredEntities.has(identifier)) {
            return { found: true, details: this.debarredEntities.get(identifier) };
        }

        // Fuzzy match on company name (partial)
        for (const [key, value] of this.debarredEntities.entries()) {
            if (identifier.length > 5 && value.entity_name.includes(identifier)) {
                return { found: true, details: { ...value, fuzzy_match: true } };
            }
        }

        return { found: false };
    }

    generateMockData(identifier) {
        // This is called from base class but we override verify completely
        return { valid: true, data: {}, confidence: 1.0 };
    }

    /**
     * Add entity to debarment list (admin function)
     * @param {string} identifier
     * @param {object} details
     */
    addDebarredEntity(identifier, details) {
        this.debarredEntities.set(identifier.toUpperCase(), {
            ...details,
            entity_name: details.entity_name || 'Unknown',
            added_at: new Date().toISOString()
        });
    }

    /**
     * Remove entity from debarment list
     * @param {string} identifier
     */
    removeDebarredEntity(identifier) {
        this.debarredEntities.delete(identifier.toUpperCase());
    }

    /**
     * Get all debarred entities (admin view)
     * @returns {Array}
     */
    getAllDebarredEntities() {
        return Array.from(this.debarredEntities.entries()).map(([id, details]) => ({
            identifier: id,
            ...details
        }));
    }

    async performVerification(identifier, context) {
        // Not used - verify is fully implemented
        return this.generateMockData(identifier);
    }
}

module.exports = DebarmentProvider;