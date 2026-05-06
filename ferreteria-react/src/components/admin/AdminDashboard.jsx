import { PRODUCTS } from '../../data/products'

const stats = [
  { label: 'Ventas totales', value: '$12,450.00', icon: '💰', color: '#2E7D32', bg: '#e8f5e9' },
  { label: 'Pedidos hoy', value: '24', icon: '🛒', color: '#1565C0', bg: '#e3f2fd' },
  { label: 'Productos', value: PRODUCTS.length, icon: '📦', color: '#FF6B35', bg: '#fff3e0' },
  { label: 'Usuarios', value: '148', icon: '👥', color: '#6a1b9a', bg: '#f3e5f5' },
]

const recentOrders = [
  { id: '#FE-2026-0041', customer: 'Juan Pérez',    total: '$341.97', status: 'entregado',  date: '28 Abr 2026' },
  { id: '#FE-2026-0040', customer: 'María López',   total: '$194.87', status: 'en-camino',  date: '27 Abr 2026' },
  { id: '#FE-2026-0039', customer: 'Carlos Gómez',  total: '$89.99',  status: 'procesando', date: '27 Abr 2026' },
  { id: '#FE-2026-0038', customer: 'Ana Martínez',  total: '$277.37', status: 'entregado',  date: '26 Abr 2026' },
  { id: '#FE-2026-0037', customer: 'Pedro Ramírez', total: '$45.99',  status: 'cancelado',  date: '26 Abr 2026' },
]

const statusColors = {
  'entregado':  { bg: '#e8f5e9', color: '#2E7D32' },
  'en-camino':  { bg: '#e3f2fd', color: '#1565C0' },
  'procesando': { bg: '#fff8e1', color: '#f57f17' },
  'cancelado':  { bg: '#ffebee', color: '#c62828' },
}

const topProducts = PRODUCTS.slice(0, 5).map((p, i) => ({
  ...p, sold: [128, 87, 234, 156, 92][i]
}))

function AdminDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '12px', padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex',
            alignItems: 'center', gap: '1rem'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px',
              background: stat.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--subtle)', marginBottom: '0.25rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Pedidos recientes */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            🛒 Pedidos recientes
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['ID', 'Cliente', 'Total', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--subtle)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>{order.id}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem' }}>{order.customer}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>{order.total}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                      background: statusColors[order.status]?.bg,
                      color: statusColors[order.status]?.color
                    }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top productos */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            📦 Productos más vendidos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                  color: i < 3 ? '#fff' : 'var(--subtle)'
                }}>{i + 1}</span>
                <img src={p.img} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--subtle)' }}>{p.sold} vendidos</p>
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>${p.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard