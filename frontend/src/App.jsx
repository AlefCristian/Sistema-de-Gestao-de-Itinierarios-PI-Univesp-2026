import { useState } from 'react';
import { Layout } from './components/Layout';
import { Produtos } from './components/Produtos';

function App() {
  const [activeTab, setActiveTab] = useState('produtos');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'produtos' && <Produtos />}
      {activeTab === 'vendas' && <div>Em breve: PDV / Tela de Vendas</div>}
      {activeTab === 'clientes' && <div>Em breve: Gestão de Clientes</div>}
    </Layout>
  );
}

export default App;