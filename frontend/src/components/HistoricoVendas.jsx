import { useState, useEffect } from 'react';
import api from '../services/api';
// Adicionados MapPin aos ícones
import { Search, Eye, X, Calendar, CreditCard, User, Tag, ShoppingBag, Edit, Trash2, MapPin } from 'lucide-react';

export function HistoricoVendas() {
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState('');
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Formatação em Reais (BRL)
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  // Formatação de Data
  const formatarData = (dataStr) => {
    if (!dataStr) return '--';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Carrega a lista de vendas ao montar o componente
  const carregarVendas = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/vendas');
      setVendas(res.data);
    } catch (err) {
      alert('Erro ao carregar o histórico de vendas.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, []);

  // Busca os detalhes (itens) de uma venda específica
  const abrirDetalhes = async (id) => {
    try {
      const res = await api.get(`/vendas/${id}`);
      setVendaSelecionada(res.data);
      setModalAberto(true);
    } catch (err) {
      alert('Erro ao carregar os detalhes da venda.');
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setVendaSelecionada(null);
  };

  // --- NOVAS FUNÇÕES: EXCLUIR E EDITAR ---

  const excluirVenda = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir/cancelar esta venda? O estoque dos produtos deverá ser devolvido.')) {
      try {
        await api.delete(`/vendas/${id}`);
        // Atualiza a lista removendo a venda excluída sem precisar recarregar a página
        setVendas(vendas.filter(v => v.id !== id));
        alert('Venda excluída com sucesso!');
      } catch (err) {
        alert(err.response?.data?.erro || 'Erro ao excluir a venda.');
      }
    }
  };

  const editarVenda = (id) => {
    // Como a edição de uma venda concluída mexe com estoque e valores, 
    // o ideal aqui é abrir um modal específico ou redirecionar de volta para o PDV.
    alert(`A funcionalidade de edição para o pedido #${id} está em desenvolvimento. Ela exigirá reverter o estoque atual.`);
  };

  // Filtro por nome do cliente ou ID da venda
  const vendasFiltradas = vendas.filter(v => {
    const termo = busca.toLowerCase();
    const nomeMatch = v.cliente_nome?.toLowerCase().includes(termo);
    const idMatch = v.id.toString().includes(termo);
    return nomeMatch || idMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 'calc(100vh - 128px)', boxSizing: 'border-box' }}>
      
      {/* Cabeçalho e Busca */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShoppingBag size={24} color="#0f172a" />
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '600' }}>Histórico de Vendas</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 14px', width: '350px' }}>
          <Search size={18} color="#94a3b8" style={{ marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Buscar por cliente ou nº do pedido..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', backgroundColor: 'transparent' }}
          />
        </div>
      </div>

      {/* Lista / Tabela de Vendas */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Pedido</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Data</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Cliente</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Local / Canal</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Pagamento</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Total</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Carregando histórico...</td>
              </tr>
            ) : vendasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Nenhuma venda encontrada.</td>
              </tr>
            ) : (
              vendasFiltradas.map((venda) => (
                <tr key={venda.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>#{venda.id}</td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>{formatarData(venda.data_venda)}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{venda.cliente_nome || 'Consumidor (Não Identificado)'}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>
                      <MapPin size={14} color="#0284c7" />
                      {venda.local_venda_nome || 'Loja Principal'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
                    {venda.forma_pagamento.replace('_', ' ')}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{formatarMoeda(venda.valor_total)}</td>
                  
                  {/* --- NOVA COLUNA DE AÇÕES --- */}
                  <td style={{ padding: '16px 20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => abrirDetalhes(venda.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center' }}
                      title="Ver Detalhes"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => editarVenda(venda.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', display: 'flex', alignItems: 'center' }}
                      title="Editar Venda"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => excluirVenda(venda.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                      title="Excluir Venda"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes da Venda (Inalterado) */}
      {modalAberto && vendaSelecionada && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Detalhes do Pedido #{vendaSelecionada.id}</h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{formatarData(vendaSelecionada.data_venda)}</span>
              </div>
              <button onClick={fecharModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Cliente</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{vendaSelecionada.cliente_nome || 'Consumidor (Não Identificado)'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Local de Venda</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{vendaSelecionada.local_venda_nome || 'Loja Principal'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><CreditCard size={14} /> Pagamento</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', textTransform: 'uppercase' }}>{vendaSelecionada.forma_pagamento.replace('_', ' ')}</div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={16} /> Produtos Comprados
              </h4>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Cód.</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Produto</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', fontWeight: '600', textAlign: 'center' }}>Qtd</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>V. Unit</th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendaSelecionada.itens?.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>{item.codigo_referencia}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{item.produto_nome}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'center' }}>{item.quantidade}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', textAlign: 'right' }}>{formatarMoeda(item.preco_unitario)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0f172a', textAlign: 'right' }}>{formatarMoeda(item.quantidade * item.preco_unitario)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Total Pago:</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{formatarMoeda(vendaSelecionada.valor_total)}</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}