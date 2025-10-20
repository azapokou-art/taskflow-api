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
    const cleanRefreshToken = refreshToken.replace(/\n/g, '');
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7);

    console.log('Tentando salvar refresh token no banco...');
    console.log('Token a ser salvo:', refreshToken);
    console.log('User ID:', usuario.id);

    db.run(
        'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
        [refreshToken, usuario.id, expiraEm.toISOString()], function(err) {
            if (err) {
                console.log('ERRO ao salvar refresh token:', err);
            } else {
                console.log('Refresh token Salvo no banco com sucesso!');
                console.log('ID do token salvo:', this.lastID);
            }
        }
    );
    ``
    res.json({ 
        mensagem: 'Login realizado com sucesso',
        accessToken: token,
        refreshToken: refreshToken,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
});
};
``
const refreshTokenHandler = async (req, res) => {
    
    console.log('=== INICIANDO REFRESH TOKEN ==='); 
    console.log('Body recebido:', req.body); 
    console.log('Refresh token recebido:', req.body.refreshToken); 

        const { refreshToken } = req.body;

        if (!refreshToken) {
            console.log('Refresh token não recebido');
            return res.status(400).json({ error: 'Refresh token é obrigatório' });
        }
        ``
        try {
  console.log('Tentando verificar JWT...');
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  console.log('Token decodificado:', decoded);
  ``
  console.log('buscando token no banco...');

  db.get('SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?', 
    [refreshToken, decoded.id], (err, tokenRow) => {
    if (err) {
      console.log('Erro no SELECT do banco:', err);

      return res.status(403).json({ error: 'Refresh token inválido' });
    }
     console.log('Resultado do banco:', tokenRow);

     if (!tokenRow) {
      console.log('Token não encontrado no banco');
      return res.status(403).json({ error: 'Refresh token inválido' });
    }

    console.log('Token válido no banco, gerando novo access token...');
    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    console.log('novo access token gerado');
    res.json({ accessToken: newAccessToken });
  });

} catch (error) {
  console.log('Erro na verificação JWT:', error.message);
  return res.status(403).json({ error: 'Refresh token inválido' });
}
};
``
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token é obrigatório'
            });
        }

        db.run(
            'DELETE FROM refresh_tokens WHERE token = ?',
            [refreshToken],
            function(err) {
                if (err) {
                    console.error('Erro ao deletar token:', err);
                    return res.status(500).json({
                        error: 'Erro interno ao fazer logout'
                    });
                }
                if (this.changes ===0) {
                    return res.status(404).json({
                        error: 'Refresh token não encontrado'
                    });
                }

                res.json({
                    success: true,
                    message: 'Logout realizado com sucesso'
                });
            }
        );

    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            error: 'Erro interno no servidor durante logout'
        });
    }
};
module.exports = { cadastrarUsuario, loginUsuario, refreshTokenHandler, logout }; 