const express = require('express');
const router = express.Router();
const { cadastrarUsuario, loginUsuario, refreshTokenHandler } = require('../controllers/usuarioController');
``
router.post('/usuarios',cadastrarUsuario);
router.post('/login', loginUsuario);
router.post('/refresh-token', refreshTokenHandler);
module.exports = router;