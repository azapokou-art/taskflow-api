const express = require('express');
const router = express.Router();
const { cadastrarUsuario, loginUsuario, refreshTokenHandler, logout, getPerfilUsuario } = require('../application/handler/usuarioHandler');
const { autenticarToken } = require('../middleware/authMiddleware');


router.post('/usuarios',cadastrarUsuario);
router.post('/login', loginUsuario);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', autenticarToken, logout);
router.get('/usuarios/perfil', autenticarToken, getPerfilUsuario);
module.exports = router;