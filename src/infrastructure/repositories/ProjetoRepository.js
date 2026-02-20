const db = require('../database/database');

class ProjetoRepository {  
    async criarProjeto(nome, descricao, usuario_id) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO projetos (nome, descricao, usuario_id) VALUES (?, ?, ?)',
                [nome, descricao, usuario_id],
                function (err) {
                    if (err) {
                        reject(new Error('Erro ao criar projeto'));
                    } else {
                        resolve({ id: this.lastID, nome, descricao, usuario_id });
                    }
                }
            );
        });
    }
    
    async listarProjetos(usuario_id) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM projetos WHERE usuario_id = ?', [usuario_id], (err, projetos) => {
                if (err) {
                    reject(new Error('Erro ao buscar projetos'));
                } else {
                    resolve(projetos);
                }
            });
        });
    }

    async buscarProjetoPorId(id, usuario_id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM projetos WHERE id = ? AND usuario_id = ?',
                [id, usuario_id],
                (err, row) => {
                    if (err) {
                        reject(new Error('Erro ao buscar projeto'));
                    } else {
                        resolve(row);
                    }
                });
        });
    }

    async atualizarProjeto(id, nome, descricao, usuario_id) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE projetos SET nome = ?, descricao =? WHERE id = ? AND usuario_id = ?',
        [nome, descricao, id, usuario_id],
        function (err) {
            if (err) {
                reject(new Error('Erro ao atualizar projeto'));
            } else {
                resolve();
            } 
        });
        });
    }

    async deletarProjeto(id, usuario_id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM projetos WHERE id = ? AND usuario_id = ?',
        [id, usuario_id],
        function (err) {
            if (err) {
                reject(new Error('Erro ao deletar projeto'));
            } else {
                resolve();
            }
        });
        });
    }  
}

module.exports = ProjetoRepository; 