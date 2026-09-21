import { useState } from 'react';
import { Package, ShoppingBag, Users, Menu, X, Glasses, LayoutDashboard, History } from 'lucide-react';
import { Dashboard } from './Dashboard';

export function Layout({ children, activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vendas', label: 'PDV / Vendas', icon: ShoppingBag },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'produtos', label: 'Estoque / Produtos', icon: Package },
  { id: 'historicoVendas', label: 'Histórico Vendas', icon: History },
];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
      fontFamily: 'Inter, system-ui, sans-serif',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      overflowX: 'hidden'
    }}>
      
      {/* Sidebar Lateral (Fixa na esquerda) */}
      <aside style={{
        width: sidebarOpen ? '260px' : '80px',
        minWidth: sidebarOpen ? '260px' : '80px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        {/* Header da Sidebar */}
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid #1e293b' }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Glasses size={28} color="#38bdf8" />
              <span style={{ fontWeight: 'bold', fontSize: '20px', letterSpacing: '1px' }}>CARV</span>
            </div>
          ) : (
            <Glasses size={28} color="#38bdf8" />
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Links de Navegação */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? '#0284c7' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '14px',
                  cursor: 'pointer',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                  width: '100%'
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        {sidebarOpen && (
          <div style={{ padding: '16px', borderTop: '1px solid #1e293b', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            CARV OS v1.0 • Univesp PI
          </div>
        )}
      </aside>

      {/* Área de Conteúdo Principal (Ocupa todo o resto da tela) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        
        {/* Navbar / Topbar */}
        <header style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px'
        }}>
          <h1 style={{ fontSize: '18px', fontWeight: '600', textTransform: 'capitalize' }}>
            {menuItems.find(m => m.id === activeTab)?.label || activeTab}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
              C
            </div>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>CARV Admin</span>
          </div>
        </header>

        {/* Conteúdo da Tela */}
        <main style={{ flex: 1, padding: '32px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

    </div>
  );
}