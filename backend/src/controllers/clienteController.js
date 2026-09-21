const db = require('../config/database');

// Listar todos os clientes
exports.listar = (req, res) => {
  db.all('SELECT * FROM clientes ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao listar clientes.' });
    }
    res.json(rows);
  });
};

// Cadastrar novo cliente
exports.criar = (req, res) => {
  const { nome, email, telefone, cpf } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'O nome do cliente é obrigatório.' });
  }

  const query = 'INSERT INTO clientes (nome, email, telefone, cpf) VALUES (?, ?, ?, ?)';
  db.run(query, [nome, email, telefone, cpf], function (err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao cadastrar cliente.' });
    }
    res.status(201).json({ id: this.lastID, nome, email, telefone, cpf });
  });
};

// Atualizar cliente existente
exports.atualizar = (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, cpf } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'O nome do cliente é obrigatório.' });
  }

  const query = `
    UPDATE clientes 
    SET nome = ?, email = ?, telefone = ?, cpf = ?
    WHERE id = ?
  `;

  db.run(query, [nome, email, telefone, cpf, id], function (err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao atualizar cliente.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }
    res.json({ mensagem: 'Cliente atualizado com sucesso!' });
  });
};

// Deletar cliente
exports.deletar = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM clientes WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao excluir cliente.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }
    res.json({ mensagem: 'Cliente excluído com sucesso!' });
  });
};