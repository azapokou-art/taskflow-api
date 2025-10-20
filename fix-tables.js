const db = require('./src/config/database');

console.log('Recriando tabela refresh_tokens...');

db.run('DROP TABLE IF EXISTS refresh_tokens', 
    function(err) {
if (err) {

console.log('Erro ao apagar tabela:', err);
process.exit(1);
} else {
console.log('Tabela antiga apagada!');

const createTableSQL = `CREATE TABLE refresh_tokens (
id INTEGER PRIMARY KEY AUTOINCREMENT,
token TEXT NOT NULL UNIQUE,
user_id INTEGER NOT NULL,
expires_at DATETIME NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES usuarios(id)
)
`;

db.run(createTableSQL, function(err) {
if (err) {
console.log('Erro ao criar tabela:', err);
process.exit(1);
} else {
console.log('Tabela refresh_tokens criada com sucesso!');
console.log('Colunas: id, token, user_id, expires_at, created_at');
process.exit(0);
}
});
}
});