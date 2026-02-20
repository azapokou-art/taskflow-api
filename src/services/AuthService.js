const jwt = require('jsonwebtoken');

class AuthService {
    gerarAccessToken(usuarioId) {
        return jwt.sign(
            { id: usuarioId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
    }
    gerarRefreshToken(usuarioId) {
        return jwt.sign(
            { id: usuarioId },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );
    }

    calcularExpiracaoRefreshToken() {
        const expiraEm = new Date();
        expiraEm.setDate(expiraEm.getDate() + 7);
        return expiraEm.toISOString();
    }

    verificarToken(token) {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    }

}

module.exports = AuthService;