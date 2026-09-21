import { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, TrendingUp, AlertTriangle, Clock, ShoppingBag } from 'lucide-react';

export function Dashboard() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const formatarMoeda = (valor) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

  const formatarData = (dataStr) => {
    if (!dataStr) return '--';
    return new Date(dataStr).toLocaleDateString('pt-BR') + ' às ' + new Date(dataStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setDados(res.data);
      } catch (err) {
        alert('Erro ao carregar os dados do Dashboard.');
      } finally {
        setCarregando(false);
      }
    };
    carregarDashboard();
  }, []);

  if (carregando) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Carregando painel...</div>;
  if (!dados) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <TrendingUp size={28} color="#0f172a" />
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a', fontWeight: '700' }}>Visão Geral</h2>
      </div>

      {/* CARDS DE RESUMO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        
        {/* Faturamento Hoje */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#dcfce7', padding: '12px', borderRadius: '12px' }}>
            <DollarSign size={24} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Faturamento Hoje</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{formatarMoeda(dados.hoje.faturamento)}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{dados.hoje.qtdVendas} pedido(s) realizados</div>
          </div>
        </div>

        {/* Faturamento Mês */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '12px' }}>
            <TrendingUp size={24} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Faturamento do Mês</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{formatarMoeda(dados.mes.faturamento)}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{dados.mes.qtdVendas} pedido(s) realizados</div>
          </div>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: ALERTA DE ESTOQUE E ÚLTIMAS VENDAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
        
        {/* Produtos Acabando */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>Alerta de Estoque</h3>
          </div>
          <div style={{ padding: '0' }}>
            {dados.estoqueBaixo.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Estoque sob controle! Nenhum produto acabando.</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {dados.estoqueBaixo.map((prod) => (
                  <li key={prod.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{prod.codigo_referencia}</div>
                      <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{prod.nome}</div>
                    </div>
                    <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', backgroundColor: prod.quantidade_estoque === 0 ? '#fef2f2' : '#fff7ed', color: prod.quantidade_estoque === 0 ? '#ef4444' : '#ea580c', fontWeight: 'bold' }}>
                      {prod.quantidade_estoque} restando
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Últimas Vendas */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={18} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>Vendas Recentes</h3>
          </div>
          <div style={{ padding: '0' }}>
            {dados.ultimasVendas.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Nenhuma venda registrada ainda.</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {dados.ultimasVendas.map((venda) => (
                  <li key={venda.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>#{venda.id} - {venda.cliente_nome || 'Consumidor'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{formatarData(venda.data_venda)}</div>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#16a34a' }}>
                      {formatarMoeda(venda.valor_total)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}