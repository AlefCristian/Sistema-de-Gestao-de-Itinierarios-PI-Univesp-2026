import { useState } from 'react';
import { Layout } from './components/Layout';
import { Produtos } from './components/Produtos';
import { Vendas } from './components/Vendas';
import { Clientes } from './components/Clientes';
import { LocaisVenda } from './components/LocaisVenda';
import { HistoricoVendas } from './components/HistoricoVendas';
import { Dashboard } from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'vendas' && <Vendas />}
      {activeTab === 'produtos' && <Produtos />}
      {activeTab === 'clientes' && <Clientes />}
      {activeTab === 'locaisVenda' && <LocaisVenda />}
      {activeTab === 'historicoVendas' && <HistoricoVendas />}
    </Layout>
  );
}

export default App;