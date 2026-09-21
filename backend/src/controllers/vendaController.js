const db = require('../config/database');

// 1. Registrar uma nova venda com baixa automática no estoque
exports.cadastrarVenda = (req, res) => {
  const { cliente_id, canal_venda, forma_pagamento, valor_desconto, itens } = req.body;

  const desconto = parseFloat(valor_desconto) || 0;

  // Normaliza o canal_venda para bater com o CHECK do SQLite: ('presencial_itinerante', 'online')
  const canalValido = (canal_venda === 'online') ? 'online' : 'presencial_itinerante';

  // Normaliza a forma_pagamento para bater com o CHECK do SQLite: ('pix', 'cartao', 'dinheiro')
  let formaPagamentoValida = 'pix';
  if (forma_pagamento === 'dinheiro') {
    formaPagamentoValida = 'dinheiro';
  } else if (forma_pagamento === 'cartao' || forma_pagamento === 'cartao_credito' || forma_pagamento === 'cartao_debito') {
    formaPagamentoValida = 'cartao';
  }

  // Validações de entrada
  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ 
      erro: 'Informe ao menos um item no carrinho de compras.' 
    });
  }

  // Inicia a transação no SQLite
  db.run('BEGIN TRANSACTION', (err) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao iniciar transação.', detalhes: err.message });
    }

    let valorTotalBruto = 0;

    // 1. Verificar se há estoque suficiente para todos os itens
    const verificarEstoque = (index) => {
      if (index >= itens.length) {
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

        item.preco_unitario = item.preco_unitario !== undefined ? item.preco_unitario : produto.preco_venda;
        valorTotalBruto += item.preco_unitario * item.quantidade;

        verificarEstoque(index + 1);
      });
    };

    // 2. Cria o registro principal da Venda
    const criarCabecalhoVenda = () => {
      const valorTotalLiquido = Math.max(0, valorTotalBruto - desconto);

      const sqlVenda = `
        INSERT INTO vendas (cliente_id, canal_venda, valor_total, forma_pagamento)
        VALUES (?, ?, ?, ?)
      `;

      db.run(sqlVenda, [cliente_id || null, canalValido, valorTotalLiquido, formaPagamentoValida], function (err) {
        if (err) {
          console.error('❌ Erro no SQL de Vendas:', err.message);
          db.run('ROLLBACK');
          return res.status(500).json({ erro: 'Erro ao registrar venda.', detalhes: err.message });
        }

        const vendaId = this.lastID;
        processarItensVenda(vendaId, 0, valorTotalLiquido);
      });
    };

    // 3. Insere os itens da venda e abata o estoque de cada produto
    const processarItensVenda = (vendaId, index, valorTotalLiquido) => {
      if (index >= itens.length) {
        db.run('COMMIT', (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ erro: 'Erro ao finalizar transação.', detalhes: err.message });
          }
          return res.status(201).json({
            mensagem: 'Venda realizada com sucesso e estoque atualizado!',
            venda_id: vendaId,
            valor_total: valorTotalLiquido
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
          console.error('❌ Erro no SQL de Itens da Venda:', err.message);
          db.run('ROLLBACK');
          return res.status(500).json({ erro: 'Erro ao registrar item da venda.', detalhes: err.message });
        }

        const sqlAbaterEstoque = `
          UPDATE produtos 
          SET quantidade_estoque = quantidade_estoque - ? 
          WHERE id = ?
        `;

        db.run(sqlAbaterEstoque, [item.quantidade, item.produto_id], (err) => {
          if (err) {
            console.error('❌ Erro ao abater estoque:', err.message);
            db.run('ROLLBACK');
            return res.status(500).json({ erro: 'Erro ao abater estoque.', detalhes: err.message });
          }

          processarItensVenda(vendaId, index + 1, valorTotalLiquido);
        });
      });
    };

    verificarEstoque(0);
  });
};

// 2. Listar histórico de vendas
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
    ORDER BY v.id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar vendas.', detalhes: err.message });
    }
    res.json(rows);
  });
};

// 3. Detalhes de uma venda específica
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

// 4. Excluir/Cancelar venda (Deleta a venda e estorna o estoque)
exports.excluirVenda = (req, res) => {
  const { id } = req.params;

  db.run('BEGIN TRANSACTION', (err) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao iniciar transação.', detalhes: err.message });
    }

    // 1. Buscar os itens da venda para saber quanto devolver pro estoque
    const sqlBuscaItens = `SELECT produto_id, quantidade FROM itens_venda WHERE venda_id = ?`;

    db.all(sqlBuscaItens, [id], (err, itens) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ erro: 'Erro ao buscar itens da venda.', detalhes: err.message });
      }

      if (!itens || itens.length === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ erro: 'Venda não encontrada ou sem itens.' });
      }

      // 2. Devolve o estoque de cada item (função recursiva)
      const estornarEstoque = (index) => {
        if (index >= itens.length) {
          return apagarRegistroVenda();
        }

        const item = itens[index];
        const sqlEstorna = `
          UPDATE produtos 
          SET quantidade_estoque = quantidade_estoque + ? 
          WHERE id = ?
        `;

        db.run(sqlEstorna, [item.quantidade, item.produto_id], (err) => {
          if (err) {
            console.error('❌ Erro ao estornar estoque:', err.message);
            db.run('ROLLBACK');
            return res.status(500).json({ erro: 'Erro ao devolver produto ao estoque.', detalhes: err.message });
          }
          estornarEstoque(index + 1);
        });
      };

      // 3. Deleta a venda do banco
      const apagarRegistroVenda = () => {
        const sqlDelete = `DELETE FROM vendas WHERE id = ?`;

        db.run(sqlDelete, [id], function(err) {
          if (err) {
            console.error('❌ Erro ao apagar venda:', err.message);
            db.run('ROLLBACK');
            return res.status(500).json({ erro: 'Erro ao excluir venda.', detalhes: err.message });
          }

          // Finaliza e salva tudo!
          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ erro: 'Erro ao finalizar transação.', detalhes: err.message });
            }
            return res.json({ mensagem: 'Venda excluída e estoque devolvido com sucesso!' });
          });
        });
      };

      // Inicia o processo de devolução
      estornarEstoque(0);
    });
  });
};