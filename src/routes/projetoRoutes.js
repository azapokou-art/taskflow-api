const express = require('express');
const router = express.Router();
const { criarProjeto, listarProjetos, buscarProjetoPorId, atualizarProjeto, deletarProjeto, listarTarefasDoProjeto } = require('../controllers/projetoController');
const { autenticarToken } = require('../middleware/authMiddleware');
router.post('/projetos', autenticarToken, criarProjeto);
router.get('/projetos', autenticarToken, listarProjetos);
router.get('/projetos/:id', autenticarToken, buscarProjetoPorId);
router.put('/projetos/:id', autenticarToken, atualizarProjeto);
router.delete('/projetos/:id', autenticarToken, deletarProjeto);
router.get('/projetos/:id/tarefas', autenticarToken, listarTarefasDoProjeto )
module.exports = router;