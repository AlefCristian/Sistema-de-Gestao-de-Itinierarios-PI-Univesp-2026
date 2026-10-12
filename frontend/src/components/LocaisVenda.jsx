import { useState, useEffect } from 'react';
import { locaisVendaService } from '../services/locaisVendaService';
import { Plus, Search, MapPin, Edit, Trash2 } from 'lucide-react';

export function LocaisVenda() {
  const [locais, setLocais] = useState([]);
  const [busca, setBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nome: '',
    descricao: ''
  });

  const carregarLocais = async () => {
    try {
      const data = await locaisVendaService.listar();
      setLocais(data);
    } catch (err) {
      alert('Erro ao carregar lista de locais de venda.');
    }
  };

  useEffect(() => {
    carregarLocais();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setForm({ nome: '', descricao: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (local) => {
    setEditingId(local.id);
    setForm({
      nome: local.nome || '',
      descricao: local.descricao || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await locaisVendaService.atualizar(editingId, form);
        alert('Local de venda atualizado com sucesso!');
      } else {
        await locaisVendaService.criar(form);
        alert('Local de venda cadastrado com sucesso!');
      }

      setForm({ nome: '', descricao: '' });
      setIsModalOpen(false);
      setEditingId(null);
      carregarLocais();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao salvar local de venda.');
    }
  };

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o local de venda "${nome}"?`)) {
      try {
        await locaisVendaService.excluir(id);
        alert('Local de venda excluído com sucesso!');
        carregarLocais();
      } catch (err) {
        alert(err.response?.data?.erro || 'Erro ao excluir local de venda.');
      }
    }
  };

  const locaisFiltrados = locais.filter(l =>
    l.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (l.descricao && l.descricao.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div>
      {/* Card de Métrica */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '14px' }}>
            <span>Total de Locais Cadastrados</span>
            <MapPin size={20} color="#0284c7" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>{locais.length}</div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', width: '320px' }}>
          <Search size={18} color="#94a3b8" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>

        <button
          onClick={handleOpenCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
        >
          <Plus size={18} />
          Novo Local de Venda
        </button>
      </div>

      {/* Tabela de Locais de Venda */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '14px 20px' }}>Nome</th>
              <th style={{ padding: '14px 20px' }}>Descrição</th>
              <th style={{ padding: '14px 20px' }}>Criado em</th>
              <th style={{ padding: '14px 20px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {locaisFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  Nenhum local de venda encontrado.
                </td>
              </tr>
            ) : (
              locaisFiltrados.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '500', color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="#0284c7" />
                      {l.nome}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{l.descricao || '-'}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '13px' }}>
                    {l.criado_em ? new Date(l.criado_em).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                      <button
                        onClick={() => handleOpenEditModal(l)}
                        title="Editar local"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', display: 'flex', alignItems: 'center' }}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(l.id, l.nome)}
                        title="Excluir local"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Reutilizável de Cadastro / Edição */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
              {editingId ? 'Editar Local de Venda' : 'Cadastrar Novo Local de Venda'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>Nome do Local *</label>
                <input
                  placeholder="Ex: Loja Centro, Quiosque Shopping..."
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>Descrição</label>
                <textarea
                  placeholder="Detalhes ou endereço do local..."
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

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
                  {editingId ? 'Atualizar Local' : 'Salvar Local'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
