class RefreshTokenRepository {
    constructor(db) {
        this.db = db;
    }

    findByTokenAndUserId(refreshToken, userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM refresh_tokens WHERE token = ? AND usuario_id = ?',
                [refreshToken, userId],
                (err, tokenRow) => {
                    if (err) {
                        console.error('Erro no SELECT do banco:', err);
                        reject(err);
                    } else {
                        console.log('Resultado do banco:', tokenRow);
                        resolve(tokenRow);
                    }
                }
            );
        });
    }

    async salvarRefreshToken(Token, userId, expiresAt) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO refresh_tokens (token, expira_em, usuario_id) VALUES (?, ?, ?)',
                [Token, expiresAt, userId],
                function (err) {
                    if (err) {
                        console.error('Erro ao salvar refresh token no banco:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    async deleteRefreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM refresh_tokens WHERE token = ?',
                [refreshToken],
                function (err) {
                    if (err) {
                        console.error('Erro ao deletar token:', err);
                        reject(new Error('Erro interno ao fazer logout'));
                    } else if (this.changes === 0) {
                        reject(new Error('Refresh token não encontrado'));
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

}
module.exports = RefreshTokenRepository;