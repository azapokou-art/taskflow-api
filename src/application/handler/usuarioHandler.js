const db = require('../../infrastructure/database/database');
const bcrypt = require('bcryptjs');
const { criarUsuarioSchema, loginSchema } = require('../../shared/validators/usuarioValidator');
const UsuarioRepository = require('../../infrastructure/repositories/UsuarioRepository');
const usuarioRepository = new UsuarioRepository();
const AuthService = require('../../services/AuthService');
const authService = new AuthService();
const RefreshTokenRepository = require('../../infrastructure/repositories/RefreshTokenRepository');
const refreshTokenRepository = new RefreshTokenRepository(db);
const jwt = require('jsonwebtoken');

const cadastrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        const validacao = criarUsuarioSchema.validate(req.body);
        if (validacao.error) {
            return res.status(400).json({ error: validacao.error.details[0].message });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const usuarioCriado = await usuarioRepository.criarUsuario(nome, email, senhaCriptografada);

        return res.status(201).json({
            id: usuarioCriado.id,
            mensagem: 'Usuário criado com sucesso'
        });

    } catch (error) {
        if (error.message === 'Erro ao criar usuário no banco') {
            return res.status(400).json({ erro: error.message });
        }
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const validacao = loginSchema.validate(req.body);
        if (validacao.error) {
            return res.status(400).json({ error: validacao.error.details[0].message });
        }

        const usuario = await usuarioRepository.buscarPorEmail(email);
        if (!usuario) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        const token = authService.gerarAccessToken(usuario.id);
        const refreshToken = authService.gerarRefreshToken(usuario.id);
        const expiraEm = authService.calcularExpiracaoRefreshToken();

        console.log('Tentando salvar refresh token no banco...');
    

        await refreshTokenRepository.salvarRefreshToken(refreshToken, usuario.id, expiraEm);

        return res.json({
            mensagem: 'Login realizado com sucesso',
            accessToken: token,
            refreshToken: refreshToken,
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({
            erro: 'Erro interno no servidor durante login'
        });
    }
};

const refreshTokenHandler = async (req, res) => {

    console.log('=== INICIANDO REFRESH TOKEN ===');
    console.log('Body recebido:', req.body);
    console.log('Refresh token recebido:', req.body.refreshToken);

    const { refreshToken } = req.body;

    if (!refreshToken) {
        console.log('Refresh token não recebido');
        return res.status(400).json({ error: 'Refresh token é obrigatório' });
    }

    try {
        const decoded = await authService.verificarToken(refreshToken);
        console.log('Token decodificado:', decoded);

        console.log('buscando token no banco...');

        const tokenRow = await refreshTokenRepository.findByTokenAndUserId(refreshToken, decoded.id);
        if (!tokenRow) {
            console.log('Refresh token não encontrado no banco');
            return res.status(403).json({ error: 'Refresh token inválido' });
        }

        console.log('Token válido no banco, gerando novo access token...');
        const novoAccessToken = authService.gerarAccessToken(decoded.id);
        console.log('Novo access token gerado com sucesso');

        return res.json({ accessToken: novoAccessToken });

    } catch (error) {
        console.log('Erro na verificação JWT:', error.message);
        return res.status(403).json({ error: 'Refresh token inválido' });
    }
};

const getPerfilUsuario = async (req, res) => {
    try {
        const usuario = await usuarioRepository.buscarPorId(req.usuarioId);
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        return res.json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            criado_em: usuario.criado_em
        });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token é obrigatório'
            });
        }

        await refreshTokenRepository.deletarRefreshToken(refreshToken);

        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });

    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            error: 'Erro interno no servidor durante logout'
        });
    }
};

module.exports = { cadastrarUsuario, loginUsuario, refreshTokenHandler, logout, getPerfilUsuario }; 