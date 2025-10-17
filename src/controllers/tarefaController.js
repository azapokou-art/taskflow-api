const db = require('../config/database');
``
const criarTarefa = (req, res) => {
    const { titulo, descricao, status, prioridade, projeto_id } = req.body;
    const usuario_id = req.usuarioId;
    console.log('=== COMEÇOU A CRIAR TAREFA ===');
    console.log('Body:', req.body);
    console.log('Usuario ID:', usuario_id);
    console.log('Projeto ID:', projeto_id);
    ``
    if (!titulo || !projeto_id) {
        return res.status(400).josn({ erro: 'Título e projeto são obrigatórios' });
    }
    ``
    db.run(
        'INSERT INTO tarefas (titulo, descricao, status, prioridade, projeto_id, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
        [titulo, descricao, status, prioridade, projeto_id, usuario_id],
        function(err) {
            if (err) {
                return res.status(400).json({ erro: 'Erro ao criar tarefa' });
            }
            res.status(201).json({ id: this.lastID, mensagem: 'Tarefa criada com sucesso' });
        }
    );
};
``
const listarTarefas = (req, res) => {
    const usuario_id = req.usuarioId;
    const { projeto_id } = req.query;
    ``
    let sql = 'SELECT * FROM tarefas WHERE usuario_id = ?';
    let params = [usuario_id];
    ``
    if (projeto_id) {
        sql += ' AND projeto_id = ?';
        params.push(projeto_id);
    }
    ``
    db.all(sql,params, (err, tarefas) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao buscar tarefas' });
        }
        res.json(tarefas);
    });
};
const buscarTarefaPorId = (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuarioId;
    console.log('=== BUSCANDO TAREFA ID:', id, '===');
    db.get( 'SELECT * FROM tarefas WHERE id = ? AND usuario_id = ?',
        [id, usuario_id],
        (err, row) => {
            if (err) {
                console.log('Erro ao buscar tarefa:', err);
                return res.status(500).json({ error: 'Erro ao buscar tarefa' });
            }
            ``
            if (!row) {
                return res.status(404).json({ error: 'Tarefa não encontrada' });
            }
            ``
            console.log('Tarefa encontrada:', row);
            res.json(row);
        }
    );
};

const atualizarTarefa = (req, res) => {
const { id } = req.params;
const {titulo, descricao, status, prioridade } = req.body;
const usuario_id = req.usuarioId;

console.log('=== ATUALIZANDO TAREFA ID:', id, '===');

db.run(
    'UPDATE tarefas SET titulo = ?, descricao = ?, status = ?, prioridade = ? WHERE id = ? AND usuario_id = ?',
    [titulo, descricao, status, prioridade, id, usuario_id],
    function(err) {
        if (err) {
            console.log('Erro ao atualizar tarefa:', err);
            return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        console.log('Tarefa atualizada com sucesso');
        res.json({ mensagem: 'Tarefa atualizada com sucesso' });
    }
);
};

const deletarTarefa = (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuarioId;

    console.log('=== DELETANDO TAREFA ID:', id, '===');

    db.run(
        'DELETE FROM tarefas WHERE id = ? AND usuario_id = ?',
        [id, usuario_id],
        function(err) {
            if (err) {
                console.log('Erro ao deletar tarefa:', err);
                return res.status(500).json({ error: 'Erro ao deletar tarefa' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Tarefa não encontrada' });
            }

            console.log('Tarefa deletada com sucesso');
            res.json({ mensagem: 'Tarefa deletada com sucesso' });
        }
    );
};

module.exports = { criarTarefa, listarTarefas, buscarTarefaPorId, atualizarTarefa, deletarTarefa };