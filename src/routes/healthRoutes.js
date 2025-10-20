const express = require('express');
    const router = express.Router();
    const db = require('../config/database');

    router.get('/health', async (req, res) => {
        try {
            db.get('SELECT 1', (err) => {
                if (err) {
                    return res.status(503).json({
                        status: 'error',
                        message: 'Database connection failed',
                        timestamp: new 
                        Date().toISOString()
                    });
                }

                res.status(200).json({
                    status: 'OK',
                    message: 'API and database are healthy',
                    timestamp: new 
                    Date().toISOString(),
                    uptime: process.uptime(),
                    environment: process.env.NODE_ENV || 'development'
                });
            });

        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Health check failed',
                error: error.message,
                timestamp: new
                Date().toISOString()
            });
        }
    });
    module.exports = router;