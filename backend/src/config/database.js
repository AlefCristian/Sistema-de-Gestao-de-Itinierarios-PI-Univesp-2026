const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('⚡ Conectado ao banco de dados da CARV!');
  }
});

db.serialize(() => {
  db.run(`PRAGMA foreign_keys = ON;`);

  // 1. Usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      criado_em DATETIME DEFAULT (DATETIME('now', 'localtime'))
    );
  `);

  // 2. Clientes
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      cpf TEXT UNIQUE,
      criado_em DATETIME DEFAULT (DATETIME('now', 'localtime'))
    );
  `);

  // 3. Produtos (Óculos de Sol e Receituário)
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_referencia TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      tipo TEXT CHECK(tipo IN ('sol', 'receituario', 'acessorio')) NOT NULL,
      marca TEXT,
      preco_custo REAL NOT NULL,
      preco_venda REAL NOT NULL,
      quantidade_estoque INTEGER DEFAULT 0,
      criado_em DATETIME DEFAULT (DATETIME('now', 'localtime'))
    );
  `);

  // 4. Vendas
  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      canal_venda TEXT CHECK(canal_venda IN ('presencial_itinerante', 'online')) NOT NULL,
      valor_total REAL NOT NULL,
      forma_pagamento TEXT CHECK(forma_pagamento IN ('pix', 'cartao', 'dinheiro')) NOT NULL,
      data_venda DATETIME DEFAULT (DATETIME('now', 'localtime')),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
    );
  `);

  // 5. Itens da Venda
  db.run(`
    CREATE TABLE IF NOT EXISTS itens_venda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      quantidade INTEGER NOT NULL,
      preco_unitario REAL NOT NULL,
      FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
    );
  `);
});

module.exports = db;