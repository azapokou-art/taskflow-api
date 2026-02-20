require('dotenv').config();
const express = require('express');
const db = require('./src/infrastructure/database/database');
const app = express();
const PORT = process.env.PORT || 3000;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const helmet = require('helmet');
app.use(helmet());
app.use(express.json());
app.use('/uploads',
    express.static('uploads'));
    
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

const sanitizeInput = require('./src/middleware/sanitizeMiddleware');
app.use(sanitizeInput);
const usuarioRouter = require('./src/router/usuarioRouter');
app.use('/api', usuarioRouter);
const projetoRouter = require('./src/router/projetoRouter');
app.use('/api', projetoRouter);
const tarefaRouter = require('./src/router/tarefaRouter');
app.use('/api', tarefaRouter);
const healthRouter = require('./src/router/healthRouter');
app.use('/api', healthRouter);
const uploadRouter = require('./src/router/uploadRouter');
app.use('/api', uploadRouter);


app.get('/', (req, res) => {
    res.json({ message: 'API está funcionando' });
});
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});                                                                                            