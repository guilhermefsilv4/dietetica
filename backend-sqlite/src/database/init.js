const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function initializeDatabase(db) {
  return new Promise((resolve, reject) => {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    db.exec(schema, (err) => {
      if (err) {
        console.error('Erro ao executar schema:', err);
        reject(err);
      } else {
        console.log('Schema executado com sucesso');
        resolve();
      }
    });
  });
}

module.exports = { initializeDatabase };
