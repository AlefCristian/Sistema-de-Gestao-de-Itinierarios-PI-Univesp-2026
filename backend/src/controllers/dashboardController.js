const db = require('../config/database');

exports.obterResumo = (req, res) => {
  // Vamos usar Promises para rodar as buscas no banco ao mesmo tempo (mais rápido)
  const buscas = [
    // 1. Faturamento de Hoje
    new Promise((resolve, reject) => {
      db.get(`SELECT SUM(valor_total) as total, COUNT(id) as qtd FROM vendas WHERE date(data_venda) = date('now', 'localtime')`, (err, row) => {
        if (err) reject(err); else resolve({ tipo: 'hoje', dados: row });
      });
    }),
    
    // 2. Faturamento do Mês
    new Promise((resolve, reject) => {
      db.get(`SELECT SUM(valor_total) as total, COUNT(id) as qtd FROM vendas WHERE strftime('%Y-%m', data_venda) = strftime('%Y-%m', 'now', 'localtime')`, (err, row) => {
        if (err) reject(err); else resolve({ tipo: 'mes', dados: row });
      });
    }),

    // 3. Produtos com Estoque Baixo (Menor ou igual a 3)
    new Promise((resolve, reject) => {
      db.all(`SELECT id, nome, codigo_referencia, quantidade_estoque FROM produtos WHERE quantidade_estoque <= 3 ORDER BY quantidade_estoque ASC LIMIT 8`, (err, rows) => {
        if (err) reject(err); else resolve({ tipo: 'estoqueBaixo', dados: rows });
      });
    }),

    // 4. Últimas 5 Vendas
    new Promise((resolve, reject) => {
      const sql = `
        SELECT v.id, v.valor_total, v.data_venda, c.nome AS cliente_nome 
        FROM vendas v LEFT JOIN clientes c ON v.cliente_id = c.id 
        ORDER BY v.id DESC LIMIT 5
      `;
      db.all(sql, (err, rows) => {
        if (err) reject(err); else resolve({ tipo: 'ultimasVendas', dados: rows });
      });
    })
  ];

  Promise.all(buscas)
    .then((resultados) => {
      const resumo = {};
      resultados.forEach(r => { resumo[r.tipo] = r.dados; });

      res.json({
        hoje: {
          faturamento: resumo.hoje.total || 0,
          qtdVendas: resumo.hoje.qtd || 0
        },
        mes: {
          faturamento: resumo.mes.total || 0,
          qtdVendas: resumo.mes.qtd || 0
        },
        estoqueBaixo: resumo.estoqueBaixo || [],
        ultimasVendas: resumo.ultimasVendas || []
      });
    })
    .catch((err) => {
      console.error('❌ Erro no Dashboard:', err);
      res.status(500).json({ erro: 'Erro ao carregar dados do dashboard.', detalhes: err.message });
    });
};