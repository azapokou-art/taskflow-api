const uploadRepository = require('../../infrastructure/repositories/UploadRepository');

const uploadImagemProjeto = async (req, res) => {
    try {
        const usuario_id = req.usuarioId;
        const projeto_id = req.params.id;

        const projeto = await uploadRepository.verificarProjeto(projeto_id, usuario_id);

        if (!projeto) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada' });
        }

    
        const imagemUrl = `/uploads/${req.file.filename}`;

        await uploadRepository.salvarImagemUrl(projeto_id, imagemUrl);
        
        res.json({
            success: true,
            message: 'Imagem uploadada com sucesso',
            imagemUrl: req.file.path
        });

    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

module.exports = { uploadImagemProjeto };