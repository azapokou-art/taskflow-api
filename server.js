require('dotenv').config();
const express = require('express');
const db = require('./src/config/database');
const app = express();
const PORT = process.env.PORT || 3000;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const helmet = require('helmet');
app.use(helmet());
app.use(express.json());
const cors = require('cors');
app.use(cors());
const limiter = require('./src/middleware/rateLimiter');
app.use(limiter);
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TaskFlow API',
            version: '1.0.0',
            description: 'API para gerenciamento de tarefas e projetos',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desenvolvimento',
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api', usuarioRoutes);
const projetoRoutes = require('./src/routes/projetoRoutes');
app.use('/api', projetoRoutes);
const tarefaRoutes = require('./src/routes/tarefaRoutes');
app.use('/api', tarefaRoutes);
const healthRoutes = require('./src/routes/healthRoutes');
app.use('/api', healthRoutes);
const sanitizeInput = require('./src/middleware/sanitizeMiddleware');
app.use(sanitizeInput);
app.get('/', (req, res) => {
    res.json({ message: 'API está funcionando' });
});
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});                                                                                            