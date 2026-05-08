import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { id: 'dashboard',      label: 'Dashboard',       icon: '📊' },
  { id: 'productos',      label: 'Productos',        icon: '📦' },
  { id: 'categorias',     label: 'Categorías',       icon: '🏷️' },
  { id: 'clientes',       label: 'Clientes',         icon: '👥' },
  { id: 'pedidos',        label: 'Pedidos',          icon: '🛒' },
  { id: 'ventas',         label: 'Ventas',           icon: '💵' },
  { id: 'caja',           label: 'Caja',             icon: '💰' },
  { id: 'proveedores',    label: 'Proveedores',      icon: '🏭' },
  { id: 'ordenes-compra', label: 'Órdenes compra',   icon: '📋' },
  { id: 'inventario',     label: 'Inventario',       icon: '⚠️' },
  { id: 'movimientos',    label: 'Movimientos',      icon: '🔄' },
  { id: 'descuentos',     label: 'Descuentos',       icon: '🎟️' },
  { id: 'reportes',       label: 'Reportes',         icon: '📈' },
]

function AdminLayout({ children, activeSection, onSectionChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const activeItem = navItems.find(i => i.id === activeSection)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '70px' : '260px',
        background: '#1a1a2e', color: '#fff',
        display: 'flex', flexDirection: 'column',
        transition: '0.3s ease', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0
        }}>
          {!collapsed && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
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
        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              title={collapsed ? item.label : ''}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '0.75rem', padding: '0.75rem 1.25rem',
                background: activeSection === item.id ? 'rgba(255,107,53,0.2)' : 'transparent',
                borderLeft: activeSection === item.id ? '3px solid var(--accent)' : '3px solid transparent',
                color: activeSection === item.id ? 'var(--accent)' : '#ccc',
                border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                fontWeight: activeSection === item.id ? 600 : 400,
                transition: '0.2s ease', textAlign: 'left',
                justifyContent: collapsed ? 'center' : 'flex-start'
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '0.75rem', padding: '0.65rem',
              background: 'rgba(255,255,255,0.05)', border: 'none',
              borderRadius: '8px', color: '#ccc', cursor: 'pointer',
              fontSize: '0.8rem', justifyContent: collapsed ? 'center' : 'flex-start'
            }}
          >
            <span>🏠</span>
            {!collapsed && <span>Ir a la tienda</span>}
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '0.75rem', padding: '0.65rem',
              background: 'rgba(198,40,40,0.15)', border: 'none',
              borderRadius: '8px', color: '#ff6b6b', cursor: 'pointer',
              fontSize: '0.8rem', justifyContent: collapsed ? 'center' : 'flex-start'
            }}
          >
            <span>🚪</span>
            {!collapsed && <span>Cerrar sesión</span>}
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
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
            {activeItem?.icon} {activeItem?.label}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--subtle)' }}>
              {user?.nombre || user?.name || user?.email || 'Admin'}
            </span>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.875rem'
            }}>
              {(user?.nombre || user?.name || 'A')[0].toUpperCase()}
            </div>
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
