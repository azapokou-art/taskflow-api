const express = require('express');
    const router = express.Router();
    const db = require('../config/database');

    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Verifica o status da API e do banco de dados
     *     description: Retorna o status de saúde da aplicação e conexão com o banco
     *     tags:
     *       - Health
     *     responses:
     *        200:
     *         description: API e banco estão saudáveis
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: "OK"
     *                 message:
     *                   type: string
     *                   example: "API and database are healthy"
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *                 uptime:
     *                   type: number
     *                   example: 1234.56
     *                 environment:
     *                   type: string
     *                   example: "development"
     *        503:
     *        description: Banco de dados offline
     */

    router.get('/health', (req, res) => {
            db.get('SELECT 1', (err) => {
                if (err) {
                    return res.status(503).json({
                        status: 'error',
                        message: 'Database connection failed',
                        timestamp: new Date().toISOString()
                    });
                }

                res.json({
                    status: 'OK',
                    message: 'API and database are healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    environment: process.env.NODE_ENV || 'development'
                });
            });
    });

    module.exports = router;