const db = require('../config/database');
``
const criarProjeto = (req, res) => {  
const {nome, descricao } = req.body;
const usuario_id = req.usuarioId;
``
if (!nome) {
return res.status(400).json({ erro: 'Nome do projerto é obrigatório' });
}
``
db.run(
'INSERT INTO projetos (nome, descricao, usuario_id) VALUES (?, ?, ?)',
[nome, descricao, usuario_id],
function(err) {
if (err) {
return res.status(400).json({ erro: 'Erro ao criar projeto' });
}
res.status(201).json({ id: this.lastID, mensagem: 'Projeto criado com sucesso' });
}
);
};
``
const listarProjetos = (req, res) => {
const usuario_id = req.usuarioId;
``
db.all('SELECT * FROM projetos WHERE usuario_id = ?', [usuario_id], (err, projetos) => {
    if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar projetos' });
    }
    res.json(projetos);
    });
};

const buscarProjetoPorId = (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuarioId;

    console.log('=== BUSCANDO PROJETO ID:', id, '===');

    db.get('SELECT * FROM projetos WHERE id = ? AND usuario_id = ?',
        [id, usuario_id],
        (err, row) => {
            if (err) {
                console.log('Erro ao buscar projeto:', err);
                return res.status(500).json({ error: 'Erro ao buscar projeto' })
            }
            if (!row) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }
            console.log('Projeto encontrado:', row);
            res.json(row);
        }
    );
};

const atualizarProjeto = (req, res) => {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const usuario_id = req.usuarioId;

    console.log('=== ATUALIZANDO PROJETO ID:', id, '===');
    db.run('UPDATE projetos SET nome = ?, descricao =? WHERE id = ? AND usuario_id = ?',
        [nome, descricao, id, usuario_id],
        function(err) {
            if (err) {
                console.log('Erro ao atualizar projeto:', err);
                return res.status(500).json({ error: 'Erro ao atualizar projeto' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }
            console.log('Projeto atualizado com sucesso');
            res.json({ mensagem: 'Projeto atualizado com sucesso' });
        }
    );
};

const deletarProjeto = (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuarioId;
    
    console.log('=== DELETANDO PROJETOS ID', id, '===');

    db.run('DELETE FROM projetos WHERE id = ? AND usuario_id = ?',
        [id, usuario_id],
        function(err) {
            if (err) {
                console.log('Erro ao deletar projeto:', err);
                return res.status(500).json({ error: 'Projeto não encontrado' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }

            console.log('Projeto deletado com sucesso');
            res.json({ memsagem: 'Projeto deletado com sucesso' });
        }
    );
};
``
const listarTarefasDoProjeto = (req, res) => {
    const usuario_id = req.usuarioId;
    const projeto_id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { status, prioridade, search, sort = 'id', order = 'desc' } = req.query;
    
    db.get('SELECT * FROM projetos WHERE id = ? AND usuario_id = ?', [projeto_id, usuario_id], (err, projeto) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao verificar projeto' });
        }
        if (!projeto) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        let sql = 'SELECT * FROM tarefas WHERE projeto_id = ? AND usuario_id = ?';

        let params = [projeto_id, usuario_id];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (prioridade) {
            sql += 'AND prioridade = ?';
            params.push(prioridade);
        }
        if (search) {
            sql += 'AND (titulo LIKE ? OR descricao LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        const allowedSortFields = ['id', 'titulo', 'prioridade', 'status'];
        const allowedOrders = ['asc', 'desc'];
        const sortField = allowedSortFields.includes(sort) ? sort : 'id';
        const sortOrder = allowedOrders.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

        sql += ` ORDER BY ${sortField} ${sortOrder}`;

        sql += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        db.all(sql, params, (err, tarefas) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao buscar tarefas do projeto' });
            }

            res.json({
                projeto: {
                    id: projeto.id,
                    nome: projeto.nome,
                    descricao: projeto.descricao },
                    tarefas: tarefas,
                    pagination: {
                        currentPage: page,
                        itemsPerPage: limit,
                        totalItems: tarefas.length
                    }
                });
            });
        });
    };

module.exports = { criarProjeto, listarProjetos, buscarProjetoPorId, atualizarProjeto, deletarProjeto, listarTarefasDoProjeto };