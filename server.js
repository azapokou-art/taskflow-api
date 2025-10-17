require('dotenv').config();
const express = require('express');
const db = require('./src/config/database');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
const cors = require('cors');
app.use(cors());
const limiter = require('./src/middleware/rateLimiter');
app.use(limiter);
const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api', usuarioRoutes);
const projetoRoutes = require('./src/routes/projetoRoutes');
app.use('/api', projetoRoutes);
const tarefaRoutes = require('./src/routes/tarefaRoutes');
app.use('/api', tarefaRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'API está funcionando' });
});
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});                                                                                            