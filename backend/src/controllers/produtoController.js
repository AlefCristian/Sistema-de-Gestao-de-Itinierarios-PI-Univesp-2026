const db = require('../config/database');

// 1. Listar todos os produtos (Estoque)
exports.listarProdutos = (req, res) => {
  const sql = `SELECT * FROM produtos ORDER BY id DESC`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar produtos.', detalhes: err.message });
    }
    res.json(rows);
  });
};

// 2. Buscar um produto específico por ID
exports.buscarProdutoPorId = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM produtos WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar produto.', detalhes: err.message });
    }
    if (!row) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    res.json(row);
  });
};

// 3. Cadastrar novo produto
exports.cadastrarProduto = (req, res) => {
  const { codigo_referencia, nome, tipo, marca, preco_custo, preco_venda, quantidade_estoque } = req.body;

  // Validação básica dos campos obrigatórios
  if (!codigo_referencia || !nome || !tipo || preco_custo === undefined || preco_venda === undefined) {
    return res.status(400).json({ erro: 'Preencha os campos obrigatórios (codigo_referencia, nome, tipo, preco_custo, preco_venda).' });
  }

  const sql = `
    INSERT INTO produtos (codigo_referencia, nome, tipo, marca, preco_custo, preco_venda, quantidade_estoque)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    codigo_referencia,
    nome,
    tipo,
    marca || null,
    preco_custo,
    preco_venda,
    quantidade_estoque || 0
  ];

  db.run(sql, params, function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ erro: 'Já existe um produto cadastrado com este código de referência.' });
      }
      return res.status(500).json({ erro: 'Erro ao cadastrar produto.', detalhes: err.message });
    }

    res.status(201).json({
      mensagem: 'Produto cadastrado com sucesso!',
      id: this.lastID
    });
  });
};

// 4. Atualizar dados do produto ou estoque
exports.atualizarProduto = (req, res) => {
  const { id } = req.params;
  const { codigo_referencia, nome, tipo, marca, preco_custo, preco_venda, quantidade_estoque } = req.body;

  const sql = `
    UPDATE produtos
    SET codigo_referencia = ?, nome = ?, tipo = ?, marca = ?, preco_custo = ?, preco_venda = ?, quantidade_estoque = ?
    WHERE id = ?
  `;

  const params = [
    codigo_referencia,
    nome,
    tipo,
    marca,
    preco_custo,
    preco_venda,
    quantidade_estoque,
    id
  ];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao atualizar produto.', detalhes: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    res.json({ mensagem: 'Produto atualizado com sucesso!' });
  });
};

// 5. Deletar produto do estoque
exports.deletarProduto = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM produtos WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao deletar produto.', detalhes: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    res.json({ mensagem: 'Produto removido do estoque com sucesso!' });
  });
};