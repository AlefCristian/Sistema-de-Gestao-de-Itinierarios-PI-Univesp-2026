const db = require('../config/database');

// 1. Registrar uma nova venda com baixa automática no estoque
exports.cadastrarVenda = (req, res) => {
  const { cliente_id, canal_venda, forma_pagamento, itens } = req.body;

  // Validações de entrada
  if (!canal_venda || !forma_pagamento || !itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ 
      erro: 'Informe o canal_venda, forma_pagamento e ao menos um item na lista de itens.' 
    });
  }

  // Inicia a transação no SQLite
  db.run('BEGIN TRANSACTION', (err) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao iniciar transação.', detalhes: err.message });
    }

    let valorTotalVenda = 0;

    // Função auxiliar para calcular o total e verificar se há estoque suficiente de todos os itens
    const verificarEstoque = (index) => {
      if (index >= itens.length) {
        // Todos os itens têm estoque suficiente! Prossegue inserindo a Venda no banco.
        return criarCabecalhoVenda();
      }

      const item = itens[index];
      const sqlBuscaProduto = `SELECT id, preco_venda, quantidade_estoque FROM produtos WHERE id = ?`;

      db.get(sqlBuscaProduto, [item.produto_id], (err, produto) => {
        if (err || !produto) {
          db.run('ROLLBACK');
          return res.status(400).json({ erro: `Produto ID ${item.produto_id} não encontrado.` });
        }

        if (produto.quantidade_estoque < item.quantidade) {
          db.run('ROLLBACK');
          return res.status(400).json({ 
            erro: `Estoque insuficiente para o produto ID ${item.produto_id}. Disponível: ${produto.quantidade_estoque}, Solicitado: ${item.quantidade}` 
          });
        }

        // Guarda o preço unitário atual e acumula no total da venda
        item.preco_unitario = produto.preco_venda;
        valorTotalVenda += produto.preco_venda * item.quantidade;

        // Passa para o próximo item
        verificarEstoque(index + 1);
      });
    };

    // Cria o registro principal da Venda
    const criarCabecalhoVenda = () => {
      const sqlVenda = `
        INSERT INTO vendas (cliente_id, canal_venda, valor_total, forma_pagamento)
        VALUES (?, ?, ?, ?)
      `;

      db.run(sqlVenda, [cliente_id || null, canal_venda, valorTotalVenda, forma_pagamento], function (err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ erro: 'Erro ao registrar venda.', detalhes: err.message });
        }

        const vendaId = this.lastID;
        processarItensVenda(vendaId, 0);
      });
    };

    // Insere os itens da venda e abata o estoque de cada produto
    const processarItensVenda = (vendaId, index) => {
      if (index >= itens.length) {
        // Todos os itens inseridos e estoques atualizados com sucesso! Finaliza a transação.
        db.run('COMMIT', (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ erro: 'Erro ao finalizar transação.', detalhes: err.message });
          }
          return res.status(201).json({
            mensagem: 'Venda realizada com sucesso e estoque atualizado!',
            venda_id: vendaId,
            valor_total: valorTotalVenda
          });
        });
        return;
      }

      const item = itens[index];
      const sqlItem = `
        INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario)
        VALUES (?, ?, ?, ?)
      `;

      db.run(sqlItem, [vendaId, item.produto_id, item.quantidade, item.preco_unitario], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ erro: 'Erro ao registrar item da venda.', detalhes: err.message });
        }

        // Abate a quantidade vendida no estoque do produto
        const sqlAbaterEstoque = `
          UPDATE produtos 
          SET quantidade_estoque = quantidade_estoque - ? 
          WHERE id = ?
        `;

        db.run(sqlAbaterEstoque, [item.quantidade, item.produto_id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ erro: 'Erro ao abater estoque.', detalhes: err.message });
          }

          // Avança para o próximo item
          processarItensVenda(vendaId, index + 1);
        });
      });
    };

    // Inicia o processo de verificação a partir do primeiro item
    verificarEstoque(0);
  });
};

// 2. Listar histórico de vendas com detalhes do cliente
exports.listarVendas = (req, res) => {
  const sql = `
    SELECT 
      v.id,
      v.canal_venda,
      v.valor_total,
      v.forma_pagamento,
      v.data_venda,
      c.nome AS cliente_nome,
      c.telefone AS cliente_telefone
    FROM vendas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    ORDER BY v.data_venda DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar vendas.', detalhes: err.message });
    }
    res.json(rows);
  });
};

// 3. Detalhes de uma venda específica com seus itens
exports.buscarVendaPorId = (req, res) => {
  const { id } = req.params;

  const sqlVenda = `
    SELECT v.*, c.nome AS cliente_nome 
    FROM vendas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    WHERE v.id = ?
  `;

  db.get(sqlVenda, [id], (err, venda) => {
    if (err || !venda) {
      return res.status(404).json({ erro: 'Venda não encontrada.' });
    }

    const sqlItens = `
      SELECT iv.*, p.nome AS produto_nome, p.codigo_referencia 
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      WHERE iv.venda_id = ?
    `;

    db.all(sqlItens, [id], (err, itens) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar itens da venda.', detalhes: err.message });
      }
      res.json({ ...venda, itens });
    });
  });
};