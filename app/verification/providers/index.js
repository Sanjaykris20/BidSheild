/**
 * Verification Providers Registry
 * Module 5: Centralized access to all government verification providers
 */

const GSTProvider = require('./gst');
const UdyamProvider = require('./udyam');
const PANProvider = require('./pan');
const IncomeTaxProvider = require('./incomeTax');
const EPFOProvider = require('./epfo');
const ESICProvider = require('./esic');
const StartupProvider = require('./startup');
const NSICProvider = require('./nsic');
const OEMProvider = require('./oem');
const DigiLockerProvider = require('./digiLocker');
const DebarmentProvider = require('./debarment');

class ProviderRegistry {
    constructor(config = {}) {
        this.config = config;
        this.providers = new Map();
        this.initializeProviders();
    }

    initializeProviders() {
        const providerConfigs = {
            gst: { class: GSTProvider, env: config.gst || 'MOCK' },
            udyam: { class: UdyamProvider, env: config.udyam || 'MOCK' },
            pan: { class: PANProvider, env: config.pan || 'MOCK' },
            income_tax: { class: IncomeTaxProvider, env: config.income_tax || 'MOCK' },
            epfo: { class: EPFOProvider, env: config.epfo || 'MOCK' },
            esic: { class: ESICProvider, env: config.esic || 'MOCK' },
            startup: { class: StartupProvider, env: config.startup || 'MOCK' },
            nsic: { class: NSICProvider, env: config.nsic || 'MOCK' },
            oem: { class: OEMProvider, env: config.oem || 'MOCK' },
            digilocker: { class: DigiLockerProvider, env: config.digilocker || 'MOCK' },
            debarment: { class: DebarmentProvider, env: config.debarment || 'MOCK' }
        };

        for (const [key, { class: ProviderClass, env }] of Object.entries(providerConfigs)) {
            const provider = new ProviderClass({
                environment: env,
                credentials: this.config.credentials?.[key] || {}
            });
            this.providers.set(key, provider);
        }
    }

    getProvider(key) {
        return this.providers.get(key);
    }

    getAllProviders() {
        return Array.from(this.providers.entries()).map(([key, provider]) => ({
            key,
            ...provider.getHealth()
        }));
    }

    setEnvironment(key, env) {
        const provider = this.providers.get(key);
        if (provider) {
            provider.setEnvironment(env);
            return true;
        }
        return false;
    }

    async verifyAll(identifiers, context = {}) {
        const results = {};

        for (const [key, provider] of this.providers.entries()) {
            const identifier = identifiers[key];
            if (identifier) {
                try {
                    results[key] = await provider.verify(identifier, context);
                } catch (error) {
                    results[key] = {
                        status: 'VERIFICATION_FAILED',
                        source: provider.source,
                        verified_at: new Date().toISOString(),
                        data: { error: error.message },
                        confidence: 0
                    };
                }
            }
        }

        return results;
    }
}

// Default config
const config = {
    gst: 'MOCK',
    udyam: 'MOCK',
    pan: 'MOCK',
    income_tax: 'MOCK',
    epfo: 'MOCK',
    esic: 'MOCK',
    startup: 'MOCK',
    nsic: 'MOCK',
    oem: 'MOCK',
    digilocker: 'MOCK',
    debarment: 'MOCK'
};

// Singleton instance
const registry = new ProviderRegistry(config);

module.exports = {
    ProviderRegistry,
    registry,
    GSTProvider,
    UdyamProvider,
    PANProvider,
    IncomeTaxProvider,
    EPFOProvider,
    ESICProvider,
    StartupProvider,
    NSICProvider,
    OEMProvider,
    DigiLockerProvider,
    DebarmentProvider
};