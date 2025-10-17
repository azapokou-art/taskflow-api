const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { criarUsuarioSchema, loginSchema } = require('../validators/usuarioValidator');
``
const cadastrarUsuario = async (req, res) => {
const { nome, email, senha } = req.body;
const validacao = criarUsuarioSchema.validate(req.body);
if (validacao.error) {
    return res.status(400).json({ error: validacao.error.details[0].message });
}
``
if (!nome || !email || !senha) {
return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
}
``
try {
const senhaCriptografada = await bcrypt.hash(senha, 10);
``
db.run(
'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
[nome, email, senhaCriptografada],
function(err) {
if (err) {
return res.status(400).json({ erro: 'Erro ao criar usuário' });
}
res.status(201).json({ id: this.lastID, mensagem: 'Usuário criado com sucesso' });
}
);
} catch (error) {
res.status(500).jason({ erro: 'Erro interno no servidor' });
}
};
``

const jwt = require('jsonwebtoken');
``
const loginUsuario = async (req, res) => {
const { email, senha } = req.body;
const validacao = loginSchema.validate(req.body);
if (validacao.error) {
    return res.status(400).json({ error: validacao.error.details[0].message });
}
``
if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
}
``
db.get('SELECT * FROM usuarios WHERE email = ?', [email],  async (err, usuario) => {
    if (err) {
        return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
    ``
    if (!usuario) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    ``
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    ``
    if (!senhaValida) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    ``
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7);
    db.run(
        'INSERT INTO refresh_tokens (token, usuario_id, expira_em) VALUES (?, ?, ?)',
        [refreshToken, usuario.id, expiraEm.toISOString()],
        function(err) {
            if (err) {
                console.log('Erro ao salvar refresh token:', err);
            }
        }
    );
    ``
    res.json({ 
        mensagem: 'Login realizado com sucesso',
        acessToken: token,
        refreshToken: refreshToken,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
});
};
``
const refreshTokenHandler = async (req, res) => {
    console.log('Body recebido:', JSON.stringify(req.body));
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token é obrigatório' });
        }
        try {
  console.log('Tentando verificar token...');
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  console.log('Token decodificado:', decoded);
  
  db.get('SELECT * FROM refresh_tokens WHERE token = ? AND usuario_id = ?', [refreshToken, decoded.id], (err, tokenRow) => {
    if (err) {
      console.log('Erro no SELECT:', err);
      return res.status(403).json({ error: 'Refresh token inválido' });
    }
    if (!tokenRow) {
      console.log('Token não encontrado no banco');
      return res.status(403).json({ error: 'Refresh token inválido' });
    }
    console.log('Token encontrado no banco:', tokenRow);
    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  });
} catch (error) {
  console.log('Erro na verificação JWT:', error.message);
  return res.status(403).json({ error: 'Refresh token inválido' });
}
};
module.exports = { cadastrarUsuario, loginUsuario, refreshTokenHandler };