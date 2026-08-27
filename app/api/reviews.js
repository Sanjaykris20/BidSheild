/**
 * Reviews Proxy Routes
 * Proxies to Python backend /reviews/*
 */

const express = require('express');
const router = express.Router();

router.all('/*', async (req, res) => {
    try {
        const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
        const targetPath = req.originalUrl.replace('/api/reviews', '/reviews');
        const url = PYTHON_BACKEND_URL + targetPath;
        const init = {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (req.method !== 'GET' && req.method !== 'DELETE') {
            init.body = JSON.stringify(req.body);
        }
        const response = await fetch(url, init);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Reviews proxy error:', error.message);
        res.status(502).json({ error: 'Review service unavailable', detail: error.message });
    }
});

module.exports = router;
