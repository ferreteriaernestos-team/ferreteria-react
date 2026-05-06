import { useState } from 'react'

const PEDIDOS = [
  { id: '#FE-2026-0041', customer: 'Juan Pérez',    email: 'juan@mail.com',   total: '$341.97', status: 'entregado',  date: '28 Abr 2026', items: 3 },
  { id: '#FE-2026-0040', customer: 'María López',   email: 'maria@mail.com',  total: '$194.87', status: 'en-camino',  date: '27 Abr 2026', items: 1 },
  { id: '#FE-2026-0039', customer: 'Carlos Gómez',  email: 'carlos@mail.com', total: '$89.99',  status: 'procesando', date: '27 Abr 2026', items: 2 },
  { id: '#FE-2026-0038', customer: 'Ana Martínez',  email: 'ana@mail.com',    total: '$277.37', status: 'entregado',  date: '26 Abr 2026', items: 4 },
  { id: '#FE-2026-0037', customer: 'Pedro Ramírez', email: 'pedro@mail.com',  total: '$45.99',  status: 'cancelado',  date: '26 Abr 2026', items: 1 },
  { id: '#FE-2026-0036', customer: 'Laura Díaz',    email: 'laura@mail.com',  total: '$129.99', status: 'procesando', date: '25 Abr 2026', items: 1 },
  { id: '#FE-2026-0035', customer: 'Roberto Sosa',  email: 'roberto@mail.com',total: '$399.99', status: 'en-camino',  date: '25 Abr 2026', items: 2 },
]

const STATUS_COLORS = {
  'entregado':  { bg: '#e8f5e9', color: '#2E7D32' },
  'en-camino':  { bg: '#e3f2fd', color: '#1565C0' },
  'procesando': { bg: '#fff8e1', color: '#f57f17' },
  'cancelado':  { bg: '#ffebee', color: '#c62828' },
}

function AdminPedidos() {
  const [pedidos, setPedidos] = useState(PEDIDOS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = pedidos.filter(p => {
    const matchSearch = p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  function changeStatus(id, newStatus) {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
  }

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por cliente o ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.65rem 1rem', border: '1.5px solid var(--border)',
            borderRadius: '8px', fontSize: '0.875rem', width: '280px', outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'procesando', 'en-camino', 'entregado', 'cancelado'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem',
                fontWeight: 600, cursor: 'pointer', border: 'none',
                background: filterStatus === status ? 'var(--accent)' : 'var(--secondary)',
                color: filterStatus === status ? '#fff' : 'var(--muted-fg)',
              }}
            >
              {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--secondary)' }}>
              {['ID', 'Cliente', 'Email', 'Items', 'Total', 'Fecha', 'Estado', 'Acción'].map(h => (
                <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>{p.id}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>{p.customer}</td>
                <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{p.email}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{p.items}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700 }}>{p.total}</td>
                <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{p.date}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    background: STATUS_COLORS[p.status]?.bg,
                    color: STATUS_COLORS[p.status]?.color
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select
                    value={p.status}
                    onChange={e => changeStatus(p.id, e.target.value)}
                    style={{
                      padding: '0.35rem 0.5rem', border: '1.5px solid var(--border)',
                      borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    <option value="procesando">Procesando</option>
                    <option value="en-camino">En camino</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminPedidos