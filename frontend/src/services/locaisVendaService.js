import api from './api';

export const locaisVendaService = {
  listar: async () => {
    const response = await api.get('/locais-venda');
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/locais-venda', dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/locais-venda/${id}`, dados);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/locais-venda/${id}`);
    return response.data;
  }
};
