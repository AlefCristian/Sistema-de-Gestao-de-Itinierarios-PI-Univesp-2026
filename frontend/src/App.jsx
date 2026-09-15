import { useState } from 'react';
import { Layout } from './components/Layout';
import { Produtos } from './components/Produtos';
import { Vendas } from './components/Vendas';

function App() {
  const [activeTab, setActiveTab] = useState('produtos');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'produtos' && <Produtos />}
      {activeTab === 'vendas' && <Vendas />}
      {activeTab === 'clientes' && <div>Em breve: Gestão de Clientes</div>}
    </Layout>
  );
}

export default App;