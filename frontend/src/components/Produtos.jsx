import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Package, AlertTriangle } from 'lucide-react';

export function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    codigo_referencia: '',
    nome: '',
    tipo: 'sol',
    marca: '',
    preco_custo: '',
    preco_venda: '',
    quantidade_estoque: ''
  });

  const carregarProdutos = async () => {
    try {
      const res = await api.get('/produtos');
      setProdutos(res.data);
    } catch (err) {
      alert('Erro ao carregar lista de produtos.');
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/produtos', {
        ...form,
        preco_custo: parseFloat(form.preco_custo),
        preco_venda: parseFloat(form.preco_venda),
        quantidade_estoque: parseInt(form.quantidade_estoque, 10)
      });

      alert('Produto cadastrado com sucesso!');
      setForm({
        codigo_referencia: '',
        nome: '',
        tipo: 'sol',
        marca: '',
        preco_custo: '',
        preco_venda: '',
        quantidade_estoque: ''
      });
      setIsModalOpen(false);
      carregarProdutos();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao cadastrar produto.');
    }
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.codigo_referencia.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      {/* Cards de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '14px' }}>
            <span>Total de Itens</span>
            <Package size={20} color="#0284c7" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>{produtos.length}</div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '14px' }}>
            <span>Estoque Baixo (&lt; 3)</span>
            <AlertTriangle size={20} color="#eab308" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px', color: '#eab308' }}>
            {produtos.filter(p => p.quantidade_estoque < 3).length}
          </div>
        </div>
      </div>

      {/* Barra de Ações (Busca + Botão Adicionar) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', width: '300px' }}>
          <Search size={18} color="#94a3b8" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Buscar por código ou nome..." 
            value={busca} 
            onChange={e => setBusca(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      {/* Tabela SaaS */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '14px 20px' }}>Cód. Ref</th>
              <th style={{ padding: '14px 20px' }}>Nome</th>
              <th style={{ padding: '14px 20px' }}>Tipo</th>
              <th style={{ padding: '14px 20px' }}>Marca</th>
              <th style={{ padding: '14px 20px' }}>Preço Venda</th>
              <th style={{ padding: '14px 20px' }}>Estoque</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              produtosFiltrados.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '500' }}>{p.codigo_referencia}</td>
                  <td style={{ padding: '14px 20px' }}>{p.nome}</td>
                  <td style={{ padding: '14px 20px', textTransform: 'capitalize' }}>{p.tipo}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{p.marca || '-'}</td>
                  <td style={{ padding: '14px 20px', fontWeight: '500' }}>R$ {Number(p.preco_venda).toFixed(2)}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: p.quantidade_estoque < 3 ? '#fef2f2' : '#f0fdf4',
                      color: p.quantidade_estoque < 3 ? '#ef4444' : '#16a34a'
                    }}>
                      {p.quantidade_estoque} un
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Estilizado */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Cadastrar Novo Óculos / Produto</h3>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <input 
                placeholder="Código Ref. (ex: SOL-001)" 
                value={form.codigo_referencia} 
                onChange={e => setForm({...form, codigo_referencia: e.target.value})} 
                required 
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
              <input 
                placeholder="Nome do Modelo" 
                value={form.nome} 
                onChange={e => setForm({...form, nome: e.target.value})} 
                required 
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
              <select 
                value={form.tipo} 
                onChange={e => setForm({...form, tipo: e.target.value})}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              >
                <option value="sol">Óculos de Sol</option>
                <option value="receituario">Receituário</option>
                <option value="acessorio">Acessório</option>
              </select>
              <input 
                placeholder="Marca" 
                value={form.marca} 
                onChange={e => setForm({...form, marca: e.target.value})} 
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input 
                  type="number" step="0.01" 
                  placeholder="Custo (R$)" 
                  value={form.preco_custo} 
                  onChange={e => setForm({...form, preco_custo: e.target.value})} 
                  required 
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
                <input 
                  type="number" step="0.01" 
                  placeholder="Venda (R$)" 
                  value={form.preco_venda} 
                  onChange={e => setForm({...form, preco_venda: e.target.value})} 
                  required 
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
              <input 
                type="number" 
                placeholder="Quantidade em Estoque" 
                value={form.quantidade_estoque} 
                onChange={e => setForm({...form, quantidade_estoque: e.target.value})} 
                required 
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '10px 18px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}