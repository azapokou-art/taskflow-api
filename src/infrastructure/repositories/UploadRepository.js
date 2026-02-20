const db = require('../../infrastructure/database/database');

const uploadRepository = {
    verificarProjeto: (projeto_id, usuario_id) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM projetos WHERE id = ? AND usuario_id = ?',
                [projeto_id, usuario_id], (err, projeto) => {
                    if (err) reject(err);
                    else resolve(projeto);
                });
        });
    },
    
    salvarImagemUrl: (projeto_id, imagemUrl) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE projetos SET imagem_url = ? WHERE id = ?',
                [imagemUrl, projeto_id], function(err) {
                    if (err) reject(err);
                    else resolve(this);
                });
        });
    }
};

module.exports = uploadRepository;