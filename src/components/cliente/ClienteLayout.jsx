import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'

const NAV = [
  { key: 'tienda',   label: 'Tienda',    icon: '🏪' },
  { key: 'carrito',  label: 'Mi carrito', icon: '🛒' },
  { key: 'pedidos',  label: 'Mis pedidos', icon: '📦' },
  { key: 'perfil',   label: 'Mi perfil',  icon: '👤' },
]

const ACCENT = '#e8781a'
const DARK   = '#1a1a2e'

export default function ClienteLayout({ section, onSection, children }) {
  const { user, logout } = useAuth()
  const { cartTotal }    = useCart()
  const navigate         = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb', fontFamily: 'var(--font-body, sans-serif)' }}>
      {/* Sidebar */}
      <aside style={{
        width: menuOpen ? '220px' : '64px',
        background: DARK,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => setMenuOpen(o => !o)}>
          <span style={{ fontSize: '1.4rem' }}>🔧</span>
          {menuOpen && <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Ferretería</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          {NAV.map(item => {
            const active = section === item.key
            const badge  = item.key === 'carrito' && cartTotal > 0 ? cartTotal : null
            return (
              <button key={item.key} onClick={() => onSection(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.75rem 1rem',
                  background: active ? `${ACCENT}22` : 'transparent',
                  border: 'none', cursor: 'pointer',
                  borderLeft: active ? `3px solid ${ACCENT}` : '3px solid transparent',
                  color: active ? ACCENT : 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap', position: 'relative',
                }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                {menuOpen && item.label}
                {badge && (
                  <span style={{
                    position: 'absolute', top: '0.4rem', left: menuOpen ? 'auto' : '2rem', right: menuOpen ? '0.75rem' : 'auto',
                    background: ACCENT, color: '#fff', borderRadius: '10px',
                    fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', minWidth: '18px', textAlign: 'center',
                  }}>{badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🚪</span>
          {menuOpen && 'Cerrar sesión'}
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ background: '#fff', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: DARK, margin: 0 }}>
            {NAV.find(n => n.key === section)?.label || 'Portal cliente'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>
              {user?.nombre?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <span style={{ fontSize: '0.85rem', color: '#555' }}>{user?.nombre || 'Cliente'}</span>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
