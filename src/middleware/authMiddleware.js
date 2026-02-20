const jwt = require('jsonwebtoken');

const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Token recebido:', token);
    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        console.log('Erro no token:', err);
        if (err) {
            return res.status(403).json({ erro: 'Token inválido' });
        }
        req.usuarioId = decoded.id;
        console.log('Usuário ID decodificado:', decoded.id);
        next();
    });
};

module.exports = { autenticarToken };