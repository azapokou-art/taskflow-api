const db = require('../../infrastructure/database/database');
const ProjetoRepository = require('../../infrastructure/repositories/ProjetoRepository');
const projetoRepository = new ProjetoRepository();

const criarProjeto = async (req, res) => {
    const { nome, descricao } = req.body;
    const usuario_id = req.usuarioId;

    if (!nome) {
        return res.status(400).json({ erro: 'Nome do projeto é obrigatório' });
    }

    try {
        const projetoCriado = await projetoRepository.criarProjeto(nome, descricao, usuario_id);
        return res.status(201).json({ id: projetoCriado.id, mensagem: 'Projeto criado com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar projeto' });
    }
};

const listarProjetos = async (req, res) => {
    const usuario_id = req.usuarioId;

    try {
        const projetos = await projetoRepository.listarProjetos(usuario_id);
       return res.json(projetos);
    } catch (err) {
        return res.status(500).json({ erro: 'Erro ao buscar projetos' });
    }
};

const buscarProjetoPorId = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuarioId;

    console.log('=== BUSCANDO PROJETO ID:', id, '===');

    try {
        const projeto = await projetoRepository.buscarProjetoPorId(id, usuario_id);
        if (!projeto) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        console.log('Projeto encontrado:', projeto);
        res.json(projeto);
    } catch (err) {
        console.log('Erro ao buscar projeto:', err);
        return res.status(500).json({ error: 'Erro ao buscar projeto' });
    }
};

const atualizarProjeto = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const usuario_id = req.usuarioId;

    console.log('=== ATUALIZANDO PROJETO ID:', id, '===');

    try {
        await projetoRepository.atualizarProjeto(id, nome, descricao, usuario_id);
        console.log('Projeto atualizado com sucesso');
        res.json({ mensagem: 'Projeto atualizado com sucesso' });
    } catch (err) {
        console.log('Erro ao atualizar projeto:', err);
        return res.status(500).json({ error: 'Erro ao atualizar projeto' });
    }
};

const deletarProjeto = (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuarioId;

    console.log('=== DELETANDO PROJETOS ID', id, '===');

    try {
        projetoRepository.deletarProjeto(id, usuario_id)
                console.log('Projeto deletado com sucesso');
                res.json({ memsagem: 'Projeto deletado com sucesso' });
    } catch (err) {
        console.log('Erro ao deletar projeto:', err);
        return res.status(500).json({ error: 'Erro ao deletar projeto' });
    }  
};

module.exports = { criarProjeto, listarProjetos, buscarProjetoPorId, atualizarProjeto, deletarProjeto };