import { useState } from 'react'

const USUARIOS = [
  { id: 1, name: 'Juan Pérez',    email: 'juan@mail.com',    role: 'cliente', status: 'activo',    orders: 5,  joined: '15 Ene 2026' },
  { id: 2, name: 'María López',   email: 'maria@mail.com',   role: 'cliente', status: 'activo',    orders: 3,  joined: '20 Feb 2026' },
  { id: 3, name: 'Carlos Gómez',  email: 'carlos@mail.com',  role: 'admin',   status: 'activo',    orders: 0,  joined: '01 Ene 2026' },
  { id: 4, name: 'Ana Martínez',  email: 'ana@mail.com',     role: 'cliente', status: 'inactivo',  orders: 8,  joined: '10 Mar 2026' },
  { id: 5, name: 'Pedro Ramírez', email: 'pedro@mail.com',   role: 'cliente', status: 'activo',    orders: 2,  joined: '05 Abr 2026' },
  { id: 6, name: 'Laura Díaz',    email: 'laura@mail.com',   role: 'cliente', status: 'activo',    orders: 1,  joined: '12 Abr 2026' },
  { id: 7, name: 'Roberto Sosa',  email: 'roberto@mail.com', role: 'cliente', status: 'bloqueado', orders: 0,  joined: '18 Abr 2026' },
]

const STATUS_COLORS = {
  'activo':    { bg: '#e8f5e9', color: '#2E7D32' },
  'inactivo':  { bg: '#fff8e1', color: '#f57f17' },
  'bloqueado': { bg: '#ffebee', color: '#c62828' },
}

const ROLE_COLORS = {
  'admin':   { bg: '#f3e5f5', color: '#6a1b9a' },
  'cliente': { bg: '#e3f2fd', color: '#1565C0' },
}

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState(USUARIOS)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const filtered = usuarios.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'all' || u.role === filterRole
    return matchSearch && matchRole
  })

  function changeStatus(id, newStatus) {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u))
  }

  function deleteUser(id) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id))
    }
  }

  return (
    <div>
      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total usuarios', value: usuarios.length, color: '#1565C0' },
          { label: 'Activos', value: usuarios.filter(u => u.status === 'activo').length, color: '#2E7D32' },
          { label: 'Admins', value: usuarios.filter(u => u.role === 'admin').length, color: '#6a1b9a' },
          { label: 'Bloqueados', value: usuarios.filter(u => u.status === 'bloqueado').length, color: '#c62828' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '12px', padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center'
          }}>
            <p style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: stat.color }}>{stat.value}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--subtle)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.65rem 1rem', border: '1.5px solid var(--border)',
            borderRadius: '8px', fontSize: '0.875rem', width: '280px', outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'cliente', 'admin'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem',
                fontWeight: 600, cursor: 'pointer', border: 'none',
                background: filterRole === role ? 'var(--accent)' : 'var(--secondary)',
                color: filterRole === role ? '#fff' : 'var(--muted-fg)',
              }}
            >
              {role === 'all' ? 'Todos' : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--secondary)' }}>
              {['Usuario', 'Email', 'Rol', 'Pedidos', 'Registrado', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'var(--accent)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.875rem', flexShrink: 0
                    }}>
                      {u.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    background: ROLE_COLORS[u.role]?.bg, color: ROLE_COLORS[u.role]?.color
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{u.orders}</td>
                <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{u.joined}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    background: STATUS_COLORS[u.status]?.bg, color: STATUS_COLORS[u.status]?.color
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={u.status}
                      onChange={e => changeStatus(u.id, e.target.value)}
                      style={{
                        padding: '0.35rem 0.5rem', border: '1.5px solid var(--border)',
                        borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="bloqueado">Bloqueado</option>
                    </select>
                    <button onClick={() => deleteUser(u.id)} style={{
                      padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem',
                      fontWeight: 600, cursor: 'pointer', border: '1.5px solid #c62828',
                      color: '#c62828', background: 'transparent'
                    }}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUsuarios