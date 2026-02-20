const db = require('../database/database');

class UsuarioRepository {
    async criarUsuario(nome, email, senhaCriptografada) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                [nome, email, senhaCriptografada],
                function (err) {
                    if (err) {
                        if (err) {
                            console.error("ERRO SQLITE:", err);
                            reject(err);
                        }
                    } else {
                        resolve({
                            id: this.lastID,
                            nome: nome,
                            email: email
                        });
                    }
                }
            );
        });
    }

    buscarPorId(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE id = ?', [id], (err, usuario) => {
                if (err) {
                    reject(new Error('Erro ao buscar usuário'));
                } else {
                    resolve(usuario);
                }
            });
        });
    }
    async buscarPorEmail(email, res) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
                if (err) {
                    reject(new Error('Erro interno do servidor'));
                    return;
                }

                if (!usuario) {
                    reject(new Error('Credenciais inválidas'));
                    return;
                }

                resolve(usuario);
            });
        });
    }
}

module.exports = UsuarioRepository;

