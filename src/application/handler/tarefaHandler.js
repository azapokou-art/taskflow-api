const db = require('../../infrastructure/database/database');
const TarefaRepository = require('../../infrastructure/repositories/TarefaRepository');
const ProjetoRepository = require('../../infrastructure/repositories/ProjetoRepository');
const tarefaRepository = new TarefaRepository();
const projetoRepository = new ProjetoRepository();

const criarTarefa = async (req, res) => {
    const { titulo, descricao, status, prioridade, projeto_id } = req.body;
    const usuario_id = req.usuarioId;
    console.log('=== COMEÇOU A CRIAR TAREFA ===');
    console.log('Body:', req.body);
    console.log('Usuario ID:', usuario_id);
    console.log('Projeto ID:', projeto_id);

    if (!titulo || !projeto_id) {
        return res.status(400).json({ erro: 'Título e projeto são obrigatórios' });
    }

    try {
        const tarefaCriada = await tarefaRepository.criarTarefa(titulo, descricao, status, prioridade, projeto_id, usuario_id);
        return res.status(201).json({ id: tarefaCriada.id, mensagem: 'Tarefa criada com sucesso' });
    } catch (err) {
        return res.status(500).json({ erro: 'Erro ao criar tarefa' });
    }
};

const listarTarefas = async (req, res) => {
    const usuario_id = req.usuarioId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { projeto_id, status, prioridade, search, sort = 'id', order = 'desc' } = req.query;

    const allowedSortFields = ['id', 'titulo', 'prioridade', 'status'];
    const allowedOrders = ['asc', 'desc'];

    const sortField = allowedSortFields.includes(sort) ? sort : 'id';
    const sortOrder = allowedOrders.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

    try {
        const tarefas = await tarefaRepository.listarTarefas(usuario_id, projeto_id, status, prioridade, search, sortField, sortOrder, limit, offset);
        res.json({
            tarefas: tarefas,
            pagination: {
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (err) {
        return res.status(500).json({ erro: 'Erro ao buscar tarefas' });
    }
};

const listarTarefasDoProjeto = async (req, res) => {
    const usuario_id = req.usuarioId;
    const projeto_id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { sort = 'id', order = 'desc' } = req.query;

    const allowedSortFields = ['id', 'titulo', 'prioridade', 'status'];
    const allowedOrders = ['asc', 'desc'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'id';
    const sortOrder = allowedOrders.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

    try {
        const projeto = await projetoRepository.buscarProjetoPorId(projeto_id, usuario_id);
        if (!projeto) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const tarefas = await tarefaRepository.listarTarefasDoProjeto(projeto_id, usuario_id, sortField, sortOrder, limit, offset);

        return res.json({
            projeto: {
                id: projeto.id,
                nome: projeto.nome,
                descricao: projeto.descricao
            },
            tarefas: tarefas,
            pagination: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems: tarefas.length
            }
        });
    } catch (err) {
        return res.status(500).json({ erro: 'Erro ao buscar projeto' });
    }
};

const buscarTarefaPorId = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuarioId;
    console.log('=== BUSCANDO TAREFA ID:', id, '===');

    try {
        const tarefa = await tarefaRepository.buscarTarefaPorId(id, usuario_id);
        if (!tarefa) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        console.log('Tarefa encontrada:', tarefa);
        return res.json(tarefa);
    } catch (err) {
        console.log('Erro ao buscar tarefa:', err);
        return res.status(500).json({ error: 'Erro ao buscar tarefa' });
    }
};

const atualizarTarefa = async (req, res) => {
    const { id } = req.params;
    const { titulo: novoTitulo, descricao: novaDescricao, status: novoStatus, prioridade: novaPrioridade } = req.body;
    const usuario_id = req.usuarioId;

    console.log('=== ATUALIZANDO TAREFA ID:', id, '===');
    
    const validarWorkflow = (statusAtual, novoStatus) => {
        const workflowPermitido = {
            'pendente': ['andamento', 'concluída'],
            'andamento': ['concluída'],
            'concluída': []
        };
        return workflowPermitido[statusAtual]?.includes(novoStatus) || false;
    }

    try {
        const tarefaAtual = await tarefaRepository.buscarTarefaPorId(id, usuario_id);
    
    if (!tarefaAtual) {
        return res.status(404).json({ error: 'Tarefa não encontrada' })
    }

    if (novoStatus && novoStatus !== tarefaAtual.status) {
        const workflowValido = validarWorkflow(tarefaAtual.status, novoStatus);
        if (!workflowValido) {
            return res.status(400).json({
                error: 'Transição de status inválida',
                detalhes: `Não é permitido mudar de "${tarefaAtual.status}" para "${novoStatus}"`
            });
        }
    }

    const atualizacao = await new Promise((resolve, reject) => {
    db.run(
        'UPDATE tarefas SET titulo = COALESCE(?, titulo), descricao = COALESCE(?, descricao), status = COALESCE(?, status), prioridade = COALESCE(?, prioridade), updated_at = datetime("now") WHERE id = ? AND usuario_id = ?',
        [novoTitulo, novaDescricao, novoStatus, novaPrioridade, id, usuario_id],
        function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }  
        }
    );
});

    if (atualizacao === 0) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    console.log('Tarefa atualizada com sucesso');
    return res.json({ mensagem: 'Tarefa atualizada com sucesso' });

} catch (err) {
    console.log('Erro ao atualizar tarefa:', err);
    return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
};
};

const deletarTarefa = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuarioId;

    console.log('=== SOFT DELETE TAREFA ID:', id, '===');

    try {
       const resultado = await tarefaRepository.deletarTarefa(id, usuario_id);
       console.log('Tarefa deletada com sucesso');
       res.json({ mensagem: 'Tarefa deletada com sucesso' });
    } catch (err) {
        if (err.message === 'Tarefa não encontrada') {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        console.log('Erro ao deletar tarefa:', err);
        return res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
};



const restaurarTarefa = async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuarioId;

    console.log('=== RESTAURANDO TAREFA ID:', id, '===');

    try {
        const resultado = await tarefaRepository.restaurarTarefa(id, usuario_id);
        console.log('Tarefa restaurada com sucesso');
        res.json({ mensagem: 'Tarefa restaurada com sucesso' });
    } catch (err) {
        if (err.message === 'Tarefa não encontrada') {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        console.log('Erro ao restaurar tarefa:', err);
        return res.status(500).json({ error: 'Erro ao restaurar tarefa' });
    }
}

module.exports = { criarTarefa, listarTarefas, listarTarefasDoProjeto, buscarTarefaPorId, atualizarTarefa, deletarTarefa, restaurarTarefa };