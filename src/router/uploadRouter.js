const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadImagemProjeto } = require('../application/handler/uploadHandler');
const { autenticarToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /projetos/{id}/upload:
 *   post:
 *     summary: Upload de imagem para projeto
 *     tags:
 *       - Upload
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagem uploadada com sucesso
 *       400:
 *         description: Nenhuma imagem enviada
 *       404:
 *         description: Projeto não encontrado
 */
router.post('/projetos/:id/upload', autenticarToken, upload.single('imagem'), uploadImagemProjeto);

module.exports = router;