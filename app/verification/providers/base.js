/**
 * Base Verification Provider Class
 * All government verification providers extend this class
 * Implements the VerificationProvider interface from Module 5 spec
 */

class VerificationProvider {
    constructor(config = {}) {
        this.name = config.name || 'Unknown';
        this.source = config.source || 'UNKNOWN';
        this.environment = config.environment || 'MOCK'; // LIVE, SANDBOX, MOCK
        this.credentials = config.credentials || {};
        this.timeout = config.timeout || 5000;
        this.rateLimit = config.rateLimit || { requests: 100, window: 60000 };
    }

    /**
     * Verify an identifier against the government service
     * @param {string} identifier - The identifier to verify (GSTIN, PAN, Udyam, etc.)
     * @param {object} context - Additional context for verification
     * @returns {Promise<object>} Standard Verification Response
     */
    async verify(identifier, context = {}) {
        const startTime = Date.now();

        try {
            // Check environment mode
            if (this.environment === 'MOCK') {
                return this.mockVerify(identifier, context);
            }

            // Rate limiting check
            await this.checkRateLimit();

            // Perform actual verification
            const result = await this.performVerification(identifier, context);

            return this.formatResponse(result, Date.now() - startTime);

        } catch (error) {
            return this.formatErrorResponse(error, Date.now() - startTime);
        }
    }

    /**
     * Mock verification for demo/development
     * @param {string} identifier
     * @param {object} context
     * @returns {Promise<object>}
     */
    async mockVerify(identifier, context) {
        // Simulate network latency
        await this.delay(50 + Math.random() * 100);

        // Deterministic mock responses based on identifier patterns
        const mockData = this.generateMockData(identifier, context);

        return {
            status: mockData.valid ? 'VERIFIED' : 'FAILED',
            source: this.source,
            verified_at: new Date().toISOString(),
            data: mockData.data,
            confidence: mockData.confidence,
            latency_ms: 50 + Math.floor(Math.random() * 100)
        };
    }

    /**
     * Generate deterministic mock data
     * @param {string} identifier
     * @param {object} context
     * @returns {object}
     */
    generateMockData(identifier, context) {
        // Default mock - override in subclasses
        return {
            valid: true,
            data: { identifier },
            confidence: 1.0
        };
    }

    /**
     * Perform actual verification - override in subclasses
     * @param {string} identifier
     * @param {object} context
     * @returns {Promise<object>}
     */
    async performVerification(identifier, context) {
        throw new Error(`${this.name} performVerification not implemented`);
    }

    /**
     * Format successful response
     * @param {object} result
     * @param {number} latency
     * @returns {object}
     */
    formatResponse(result, latency) {
        return {
            status: result.status || 'VERIFIED',
            source: this.source,
            verified_at: new Date().toISOString(),
            data: result.data || {},
            confidence: result.confidence || 1.0,
            latency_ms: latency
        };
    }

    /**
     * Format error response
     * @param {Error} error
     * @param {number} latency
     * @returns {object}
     */
    formatErrorResponse(error, latency) {
        const statusMap = {
            'NOT_FOUND': 'NOT_FOUND',
            'UNAUTHORIZED': 'UNAVAILABLE',
            'TIMEOUT': 'UNAVAILABLE',
            'RATE_LIMITED': 'UNAVAILABLE'
        };

        const status = statusMap[error.code] || 'VERIFICATION_FAILED';

        return {
            status,
            source: this.source,
            verified_at: new Date().toISOString(),
            data: { error: error.message, code: error.code },
            confidence: 0,
            latency_ms: latency
        };
    }

    /**
     * Rate limiting check
     * @returns {Promise<void>}
     */
    async checkRateLimit() {
        // Simple in-memory rate limiting
        // In production, use Redis or similar
        return Promise.resolve();
    }

    /**
     * Utility delay function
     * @param {number} ms
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get provider health status
     * @returns {object}
     */
    getHealth() {
        return {
            name: this.name,
            source: this.source,
            environment: this.environment,
            status: this.environment === 'MOCK' ? 'MOCK' : 'HEALTHY',
            last_check: new Date().toISOString()
        };
    }

    /**
     * Set environment mode
     * @param {string} env - LIVE, SANDBOX, MOCK
     */
    setEnvironment(env) {
        if (['LIVE', 'SANDBOX', 'MOCK'].includes(env)) {
            this.environment = env;
        } else {
            throw new Error('Invalid environment. Must be LIVE, SANDBOX, or MOCK');
        }
    }
}

module.exports = VerificationProvider;