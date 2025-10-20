const express = require('express');
const router = express.Router();
const { cadastrarUsuario, loginUsuario, refreshTokenHandler, logout, } = require('../controllers/usuarioController');
const { autenticarToken } = require('../middleware/authMiddleware');
``
router.post('/usuarios',cadastrarUsuario);
router.post('/login', loginUsuario);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', autenticarToken, logout);
module.exports = router;