import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'productos', label: 'Productos', icon: '📦' },
  { id: 'pedidos', label: 'Pedidos', icon: '🛒' },
  { id: 'usuarios', label: 'Usuarios', icon: '👥' },
  { id: 'reportes', label: 'Reportes', icon: '📈' },
]

function AdminLayout({ children, activeSection, onSectionChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '70px' : '260px',
        background: '#1a1a2e', color: '#fff',
        display: 'flex', flexDirection: 'column',
        transition: '0.3s ease', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {!collapsed && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
              Ferretería <span style={{ color: 'var(--accent)' }}>Admin</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            color: '#fff', background: 'rgba(255,255,255,0.1)',
            border: 'none', borderRadius: '6px', width: '32px', height: '32px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', flexShrink: 0
          }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '0.75rem', padding: '0.875rem 1.25rem',
                background: activeSection === item.id ? 'rgba(255,107,53,0.2)' : 'transparent',
                borderLeft: activeSection === item.id ? '3px solid var(--accent)' : '3px solid transparent',
                color: activeSection === item.id ? 'var(--accent)' : '#ccc',
                border: 'none', cursor: 'pointer', fontSize: '0.9rem',
                fontWeight: activeSection === item.id ? 600 : 400,
                transition: '0.2s ease', textAlign: 'left',
                justifyContent: collapsed ? 'center' : 'flex-start'
              }}
            >
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '0.75rem', padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)', border: 'none',
              borderRadius: '8px', color: '#ccc', cursor: 'pointer',
              fontSize: '0.875rem', justifyContent: collapsed ? 'center' : 'flex-start'
            }}
          >
            <span>🚪</span>
            {!collapsed && <span>Volver a la tienda</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Top bar */}
        <div style={{
          background: '#fff', padding: '1rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 10
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700
          }}>
            {navItems.find(i => i.id === activeSection)?.icon} {navItems.find(i => i.id === activeSection)?.label}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--subtle)' }}>Admin</span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.875rem'
            }}>A</div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout