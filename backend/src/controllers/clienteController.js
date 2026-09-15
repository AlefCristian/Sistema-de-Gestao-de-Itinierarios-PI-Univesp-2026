const db = require('../config/database');

// 1. Listar todos os clientes
exports.listarClientes = (req, res) => {
  const sql = `SELECT * FROM clientes ORDER BY nome ASC`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar clientes.', detalhes: err.message });
    }
    res.json(rows);
  });
};

// 2. Buscar cliente por ID
exports.buscarClientePorId = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM clientes WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar cliente.', detalhes: err.message });
    }
    if (!row) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }
    res.json(row);
  });
};

// 3. Cadastrar novo cliente
exports.cadastrarCliente = (req, res) => {
  const { nome, telefone, email, cpf } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'O nome do cliente é obrigatório.' });
  }

  const sql = `
    INSERT INTO clientes (nome, telefone, email, cpf)
    VALUES (?, ?, ?, ?)
  `;

  const params = [nome, telefone || null, email || null, cpf || null];

  db.run(sql, params, function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ erro: 'Já existe um cliente cadastrado com este CPF.' });
      }
      return res.status(500).json({ erro: 'Erro ao cadastrar cliente.', detalhes: err.message });
    }

    res.status(201).json({
      mensagem: 'Cliente cadastrado com sucesso!',
      id: this.lastID
    });
  });
};

// 4. Atualizar dados do cliente
exports.atualizarCliente = (req, res) => {
  const { id } = req.params;
  const { nome, telefone, email, cpf } = req.body;

  const sql = `
    UPDATE clientes
    SET nome = ?, telefone = ?, email = ?, cpf = ?
    WHERE id = ?
  `;

  const params = [nome, telefone, email, cpf, id];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao atualizar cliente.', detalhes: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    res.json({ mensagem: 'Cliente atualizado com sucesso!' });
  });
};

// 5. Deletar cliente
exports.deletarCliente = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM clientes WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao deletar cliente.', detalhes: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    res.json({ mensagem: 'Cliente removido com sucesso!' });
  });
};