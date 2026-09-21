import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Users, Mail, Phone, FileText, Pencil, Trash2 } from 'lucide-react';

export function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  });

  // Funções para formatar e aplicar máscaras nos campos
  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const maskTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const carregarClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      alert('Erro ao carregar lista de clientes.');
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  // Abrir Modal para Criar
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setForm({ nome: '', email: '', telefone: '', cpf: '' });
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEditModal = (cliente) => {
    setEditingId(cliente.id);
    setForm({
      nome: cliente.nome || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      cpf: cliente.cpf || ''
    });
    setIsModalOpen(true);
  };

  // Salvar (Criação ou Edição)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/clientes/${editingId}`, form);
        alert('Cliente atualizado com sucesso!');
      } else {
        await api.post('/clientes', form);
        alert('Cliente cadastrado com sucesso!');
      }

      setForm({ nome: '', email: '', telefone: '', cpf: '' });
      setIsModalOpen(false);
      setEditingId(null);
      carregarClientes();
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao salvar cliente.');
    }
  };

  // Excluir Cliente
  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
      try {
        await api.delete(`/clientes/${id}`);
        alert('Cliente excluído com sucesso!');
        carregarClientes();
      } catch (err) {
        alert(err.response?.data?.erro || 'Erro ao excluir cliente.');
      }
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.cpf && c.cpf.includes(busca)) ||
    (c.email && c.email.toLowerCase().includes(busca.toLowerCase())) ||
    (c.telefone && c.telefone.includes(busca))
  );

  return (
    <div>
      {/* Card de Métrica */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '14px' }}>
            <span>Total de Clientes Cadastrados</span>
            <Users size={20} color="#0284c7" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>{clientes.length}</div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', width: '320px' }}>
          <Search size={18} color="#94a3b8" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, e-mail ou telefone..."
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
          Novo Cliente
        </button>
      </div>

      {/* Tabela de Clientes */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '14px 20px' }}>Nome</th>
              <th style={{ padding: '14px 20px' }}>CPF</th>
              <th style={{ padding: '14px 20px' }}>E-mail</th>
              <th style={{ padding: '14px 20px' }}>Telefone</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              clientesFiltrados.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '500', color: '#0f172a' }}>{c.nome}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="#94a3b8" />
                      {c.cpf || '-'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="#94a3b8" />
                      {c.email || '-'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="#94a3b8" />
                      {c.telefone || '-'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        title="Editar cliente"
                        style={{ border: 'none', background: '#f1f5f9', color: '#0f172a', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        <Pencil size={14} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.nome)}
                        title="Excluir cliente"
                        style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        <Trash2 size={14} /> Excluir
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
              {editingId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>Nome Completo *</label>
                <input
                  placeholder="Ex: Ana Silva"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>CPF</label>
                <input
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={e => setForm({ ...form, cpf: maskCPF(e.target.value) })}
                  maxLength={14}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>E-mail</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>Telefone / WhatsApp</label>
                <input
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={e => setForm({ ...form, telefone: maskTelefone(e.target.value) })}
                  maxLength={15}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
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
                  {editingId ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}