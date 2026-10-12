const db = require('../config/database');

// Listar todos os locais de venda
exports.listar = (req, res) => {
  db.all('SELECT * FROM locais_venda ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao listar locais de venda.' });
    }
    res.json(rows);
  });
};

// Buscar local de venda por ID
exports.buscarPorId = (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM locais_venda WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar local de venda.' });
    }
    if (!row) {
      return res.status(404).json({ erro: 'Local de venda não encontrado.' });
    }
    res.json(row);
  });
};

// Cadastrar novo local de venda
exports.criar = (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'O nome do local de venda é obrigatório.' });
  }

  const query = 'INSERT INTO locais_venda (nome, descricao) VALUES (?, ?)';
  db.run(query, [nome, descricao], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ erro: 'Já existe um local de venda cadastrado com este nome.' });
      }
      return res.status(500).json({ erro: 'Erro ao cadastrar local de venda.' });
    }
    res.status(201).json({ id: this.lastID, nome, descricao });
  });
};

// Atualizar local de venda existente
exports.atualizar = (req, res) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'O nome do local de venda é obrigatório.' });
  }

  const query = `
    UPDATE locais_venda 
    SET nome = ?, descricao = ?
    WHERE id = ?
  `;

  db.run(query, [nome, descricao, id], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ erro: 'Já existe um local de venda cadastrado com este nome.' });
      }
      return res.status(500).json({ erro: 'Erro ao atualizar local de venda.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Local de venda não encontrado.' });
    }
    res.json({ mensagem: 'Local de venda atualizado com sucesso!' });
  });
};

// Deletar local de venda
exports.deletar = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM locais_venda WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao excluir local de venda.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Local de venda não encontrado.' });
    }
    res.json({ mensagem: 'Local de venda excluído com sucesso!' });
  });
};
