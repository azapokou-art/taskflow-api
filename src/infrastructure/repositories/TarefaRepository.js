const db = require('../database/database');

class TarefaRepository {
    async criarTarefa(titulo, descricao, status, prioridade, projeto_id, usuario_id) {
    console.log('REPOSITORY - Valores recebidos:', { 
        titulo, 
        descricao, 
        status, 
        prioridade, 
        projeto_id, 
        usuario_id 
    });
    

    console.log('REPOSITORY - Tipos dos valores:', {
        titulo: typeof titulo,
        descricao: typeof descricao,
        status: typeof status,
        prioridade: typeof prioridade,
        projeto_id: typeof projeto_id,
        usuario_id: typeof usuario_id
    });
    
    return new Promise((resolve, reject) => {
        const finalStatus = status || 'pendente';
        const finalPrioridade = prioridade || 'media';
        

        console.log('REPOSITORY - Valores finais para INSERT:', [
            titulo, 
            descricao, 
            finalStatus, 
            finalPrioridade, 
            projeto_id, 
            usuario_id
        ]);
        
        db.run(
            'INSERT INTO tarefas (titulo, descricao, status, prioridade, projeto_id, usuario_id, criado_em, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
            [titulo, descricao, finalStatus, finalPrioridade, projeto_id, usuario_id],
            function (err) {
                console.log('REPOSITORY - Erro no INSERT:', err);
                if (err) {
                    reject(new Error('Erro ao criar tarefa: ' + err.message));
                } else {
                    resolve({ 
                        id: this.lastID, 
                        titulo, 
                        descricao, 
                        status: finalStatus, 
                        prioridade: finalPrioridade, 
                        projeto_id, 
                        usuario_id 
                    });
                }
            }
        );
    });
}

    async listarTarefas(usuario_id, projeto_id, status, prioridade, search, sortField, sortOrder, limit, offset) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM tarefas WHERE usuario_id = ? AND deleted = 0';
            let params = [usuario_id];

            if (projeto_id) {
                sql += ' AND projeto_id = ?';
                params.push(projeto_id);
            }

            if (status) {
                sql += ' AND status = ?';
                params.push(status);
            }

            if (prioridade) {
                sql += ' AND prioridade = ?';
                params.push(prioridade);
            }

            if (search) {
                sql += ' AND (titulo LIKE ? OR descricao LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            sql += ` ORDER BY ${sortField} ${sortOrder}`;
            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            db.all(sql, params, (err, tarefas) => {
                if (err) {
                    reject(new Error('Erro ao buscar tarefas: ' + err.message));
                } else {
                    resolve(tarefas);
                }
            });
        });
    }

    async listarTarefasDoProjeto(projeto_id, usuario_id, sortField, sortOrder, limit, offset) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM tarefas WHERE projeto_id = ? AND usuario_id = ? AND deleted = 0';
            let params = [projeto_id, usuario_id];

            sql += ` ORDER BY ${sortField} ${sortOrder}`;
            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            db.all(sql, params, (err, tarefas) => {
                if (err) {
                    reject(new Error('Erro ao buscar tarefas do projeto: ' + err.message));
                } else {
                    resolve(tarefas);
                }
            });
        });
    }

    async buscarTarefaPorId(id, usuario_id) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM tarefas WHERE id = ? AND usuario_id = ? AND deleted = 0',
                [id, usuario_id],
                (err, tarefa) => {
                    if (err) {
                        reject(new Error('Erro ao buscar tarefa: ' + err.message));
                    } else {
                        resolve(tarefa);
                    }
                }
            );
        });
    }

    async atualizarTarefa(id, novoTitulo, novaDescricao, novoStatus, novaPrioridade, usuario_id) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE tarefas SET titulo = COALESCE(?, titulo), descricao = COALESCE(?, descricao), status = COALESCE(?, status), prioridade = COALESCE(?, prioridade), updated_at = datetime("now") WHERE id = ? AND usuario_id = ?',
                [novoTitulo, novaDescricao, novoStatus, novaPrioridade, id, usuario_id],
                function (err) {
                    if (err) {
                        reject(new Error('Erro ao atualizar tarefa: ' + err.message));
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    async deletarTarefa(id, usuario_id) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE tarefas SET deleted = 1, deleted_at = datetime("now"), updated_at = datetime("now") WHERE id = ? AND usuario_id = ?',
                [id, usuario_id],
                function (err) {
                    if (err) {
                        reject(new Error('Erro ao deletar tarefa: ' + err.message));
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    async restaurarTarefa(id, usuario_id) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE tarefas SET deleted = 0, deleted_at = NULL, updated_at = datetime("now") WHERE id = ? AND usuario_id = ?',
                [id, usuario_id],
                function (err) {
                    if (err) {
                        reject(new Error('Erro ao restaurar tarefa: ' + err.message));
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }
}

module.exports = TarefaRepository;