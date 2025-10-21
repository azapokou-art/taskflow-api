const express = require('express');
const router = express.Router();
const { criarTarefa, listarTarefas, buscarTarefaPorId, atualizarTarefa, deletarTarefa, restaurarTarefa } = require('../controllers/tarefaController');
const { autenticarToken } = require('../middleware/authMiddleware');

router.post('/tarefas', autenticarToken, criarTarefa);
router.get('/tarefas', autenticarToken, listarTarefas);
router.get('/tarefas/:id', autenticarToken, buscarTarefaPorId);
router.put('/tarefas/:id', autenticarToken, atualizarTarefa);
router.delete('/tarefas/:id', autenticarToken, deletarTarefa);
router.put('/tarefas/:id/restaurar', autenticarToken, restaurarTarefa);
module.exports = router;