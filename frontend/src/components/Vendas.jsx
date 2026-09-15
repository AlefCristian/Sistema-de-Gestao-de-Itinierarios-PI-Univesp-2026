import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Trash2, ShoppingBag, CheckCircle, User, CreditCard } from 'lucide-react';

export function Vendas() {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [desconto, setDesconto] = useState(0);
  const [sucessoModal, setSucessoModal] = useState(false);

  // Carrega produtos e clientes da API
  useEffect(() => {
    async function carregarDados() {
      try {
        const [resProdutos, resClientes] = await Promise.all([
          api.get('/produtos'),
          api.get('/clientes')
        ]);
        setProdutos(resProdutos.data);
        setClientes(resClientes.data);
      } catch (err) {
        alert('Erro ao carregar dados para o PDV.');
      }
    }
    carregarDados();
  }, []);

  // Adiciona item ao carrinho
  const adicionarAoCarrinho = (produto) => {
    if (produto.quantidade_estoque <= 0) {
      alert('Produto sem estoque disponível.');
      return;
    }

    const itemExistente = carrinho.find(item => item.produto_id === produto.id);

    if (itemExistente) {
      if (itemExistente.quantidade >= produto.quantidade_estoque) {
        alert('Quantidade máxima do estoque atingida.');
        return;
      }
      setCarrinho(carrinho.map(item =>
        item.produto_id === produto.id
          ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.preco_unitario }
          : item
      ));
    } else {
      setCarrinho([
        ...carrinho,
        {
          produto_id: produto.id,
          nome: produto.nome,
          codigo_referencia: produto.codigo_referencia,
          preco_unitario: produto.preco_venda,
          quantidade: 1,
          subtotal: produto.preco_venda
        }
      ]);
    }
  };

  // Altera quantidade no carrinho
  const alterarQuantidade = (produto_id, delta) => {
    setCarrinho(carrinho.map(item => {
      if (item.produto_id === produto_id) {
        const prodOriginal = produtos.find(p => p.id === produto_id);
        const novaQtd = item.quantidade + delta;

        if (novaQtd > prodOriginal.quantidade_estoque) {
          alert('Estoque insuficiente.');
          return item;
        }

        if (novaQtd <= 0) return null;

        return { ...item, quantidade: novaQtd, subtotal: novaQtd * item.preco_unitario };
      }
      return item;
    }).filter(Boolean));
  };

  // Remover item
  const removerItem = (produto_id) => {
    setCarrinho(carrinho.filter(item => item.produto_id !== produto_id));
  };

  // Cálculos do pedido
  const totalBruto = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
  const valorDesconto = parseFloat(desconto) || 0;
  const totalLiquido = Math.max(0, totalBruto - valorDesconto);

  // Finalizar venda no backend
  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      alert('Adicione ao menos um produto ao carrinho.');
      return;
    }

    try {
      await api.post('/vendas', {
        cliente_id: clienteId ? parseInt(clienteId, 10) : null,
        forma_pagamento: formaPagamento,
        valor_desconto: valorDesconto,
        itens: carrinho.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }))
      });

      setSucessoModal(true);
      setCarrinho([]);
      setDesconto(0);
      setClienteId('');
      
      // Recarrega lista de produtos para atualizar estoques visuais
      const resProds = await api.get('/produtos');
      setProdutos(resProds.data);
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao registrar venda.');
    }
  };

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.codigo_referencia.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', minHeight: 'calc(100vh - 128px)' }}>
      
      {/* Coluna Esquerda: Vitrine / Seleção de Produtos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Barra de Busca */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Search size={20} color="#94a3b8" style={{ marginRight: '12px' }} />
          <input
            type="text"
            placeholder="Buscar óculos por nome ou código de referência..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px' }}
          />
        </div>

        {/* Grade de Produtos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', overflowY: 'auto' }}>
          {produtosFiltrados.map(produto => (
            <div
              key={produto.id}
              onClick={() => adicionarAoCarrinho(produto)}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                opacity: produto.quantidade_estoque <= 0 ? 0.5 : 1
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#0284c7', textTransform: 'uppercase' }}>
                {produto.codigo_referencia}
              </div>
              <h4 style={{ margin: '6px 0 12px 0', fontSize: '15px', color: '#0f172a', fontWeight: '600' }}>
                {produto.nome}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                  R$ {Number(produto.preco_venda).toFixed(2)}
                </span>
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: produto.quantidade_estoque < 3 ? '#fef2f2' : '#f0fdf4',
                  color: produto.quantidade_estoque < 3 ? '#ef4444' : '#16a34a',
                  fontWeight: '600'
                }}>
                  {produto.quantidade_estoque} un
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna Direita: Carrinho e Checkout */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <ShoppingBag size={22} color="#0f172a" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Carrinho do Pedido</h3>
          </div>

          {/* Seleção do Cliente */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <User size={14} /> Cliente (Opcional)
            </label>
            <select
              value={clienteId}
              onChange={e => setClienteId(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            >
              <option value="">Cliente Não Identificado (Consumidor)</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} - {c.cpf || 'Sem CPF'}</option>
              ))}
            </select>
          </div>

          {/* Lista de Itens do Carrinho */}
          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {carrinho.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontSize: '14px' }}>
                Carrinho vazio.<br />Clique nos produtos para adicionar.
              </div>
            ) : (
              carrinho.map(item => (
                <div key={item.produto_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item.nome}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>R$ {item.preco_unitario.toFixed(2)} un</div>
                  </div>

                  {/* Botões Qtd */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 12px' }}>
                    <button onClick={() => alterarQuantidade(item.produto_id, -1)} style={{ border: '1px solid #cbd5e1', background: '#fff', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.quantidade}</span>
                    <button onClick={() => alterarQuantidade(item.produto_id, 1)} style={{ border: '1px solid #cbd5e1', background: '#fff', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>R$ {item.subtotal.toFixed(2)}</div>
                    <button onClick={() => removerItem(item.produto_id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fechamento da Venda */}
        <div style={{ borderTop: '1px solid #f1f5f9', pt: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
            <span>Subtotal:</span>
            <span>R$ {totalBruto.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Desconto (R$):</span>
            <input
              type="number"
              step="0.01"
              value={desconto}
              onChange={e => setDesconto(e.target.value)}
              style={{ width: '90px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
            />
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <CreditCard size={14} /> Forma de Pagamento
            </label>
            <select
              value={formaPagamento}
              onChange={e => setFormaPagamento(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            >
              <option value="pix">PIX</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="dinheiro">Dinheiro</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '8px 0' }}>
            <span>Total:</span>
            <span>R$ {totalLiquido.toFixed(2)}</span>
          </div>

          <button
            onClick={finalizarVenda}
            disabled={carrinho.length === 0}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: carrinho.length === 0 ? '#cbd5e1' : '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: carrinho.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Finalizar Pedido
          </button>
        </div>

      </div>

      {/* Modal de Sucesso */}
      {sucessoModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', textAlign: 'center', maxWidth: '360px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Venda Concluída!</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>O pedido foi registrado e o estoque dos itens foi atualizado no sistema.</p>
            <button
              onClick={() => setSucessoModal(false)}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              Iniciar Nova Venda
            </button>
          </div>
        </div>
      )}

    </div>
  );
}