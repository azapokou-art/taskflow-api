const db = require('../config/database');
const path = require('path');

const uploadImagemProjeto = (req, res) => {
    try {
        const usuario_id = req.usuarioId;
        const projeto_id = req.params.id;

        db.get('SELECT * FROM projetos WHERE id = ? AND usuario_id = ?',
            [projeto_id, usuario_id], (err, projeto) => {

                if (err) {
                return res.status(500).json({ error: 'Erro ao verificar projeto' });
            }

            if (!projeto) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'Nenhuma imagem enviada' });
            }

            const imagemUrl = `/uploads/$ {req.file.filename}`;

            db.run('UPDATE projetos SET imagem_url = ? WHERE id = ?',
                [imagemUrl, projeto_id],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Erro ao salvar imagem' });
                    }
                    res.json({
                        success: true,
                        message: 'Imagem uploadada com sucesso',
                        imagemUrl: req.file.path
                    });
                });
            });

        } catch (error) {
            res.status(500).json({ error: 'Erro interno no servidor' });
        }
    };

    module.exports = { uploadImagemProjeto };
