const db = require('./src/config/database');
db.run('CREATE TABLE IF NOT EXISTS refresh_tokens ('
id INTEGER PRIMARY KEY AUTOINCREMENT, 
token TEXT NOT NULL,
usuario_id INTEGER NOT NULL,
expira_em DATETIME NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREING KEY (usuario_id) REFERENCES usuarios(id)
')', function(err) {`
if (err) {
console.log('Erro ao criar tabela:', err);
} else {
console.log('Tabela refresh_tokens criada com sucesso!');
}
process.exit();
});