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
module.exports = { criarProjeto, listarProjetos, buscarProjetoPorId, atualizarProjeto, deletarProjeto };