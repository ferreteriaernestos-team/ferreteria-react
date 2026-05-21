import { useState, useEffect, useCallback } from 'react'
import { getUsuarios, getRoles, deleteUsuario, register } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import Modal from './shared/Modal'
import Pagination from './shared/Pagination'
import * as Icons from './shared/Icons'
import StatusBadge from './shared/StatusBadge'

const ROLE_COLORS = {
  admin:    { bg: '#f3e5f5', color: '#6a1b9a' },
  cliente:  { bg: '#e3f2fd', color: '#1565C0' },
  operador: { bg: '#e8f5e9', color: '#2E7D32' },
}

const emptyForm = { nombre: '', email: '', password: '', rol_id: '' }

const limit = 10

function AdminUsuarios() {
  const [usuarios, setUsuarios]   = useState([])
  const [roles, setRoles]         = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    getUsuarios({ page, limit })
      .then(r => {
        setUsuarios(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    getRoles()
      .then(r => setRoles(toArr(r.data?.data || r.data)))
      .catch(() => {})
  }, [])

  async function handleBuscar() {
    if (!search.trim()) return cargar()
    setLoading(true)
    try {
      const r = await getUsuarios({ buscar: search.trim(), limit: 50 })
      setUsuarios(toArr(r.data))
      setTotal(toTotal(r.data))
    } catch {
      setUsuarios([]); setTotal(0)
    } finally { setLoading(false) }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await deleteUsuario(id)
      setUsuarios(prev => prev.filter(u => u.id !== id))
      setTotal(t => t - 1)
    } catch { alert('No se pudo eliminar el usuario') }
  }

  async function handleSubmit() {
    if (!form.nombre.trim() || !form.email.trim() || !form.password.trim()) {
      return setError('Nombre, email y contraseña son requeridos')
    }
    if (!form.rol_id) return setError('Selecciona un rol')
    setSaving(true); setError(null)
    try {
      await register({ nombre: form.nombre, email: form.email, password: form.password, rol_id: parseInt(form.rol_id) })
      setShowForm(false)
      setForm(emptyForm)
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear usuario')
    } finally { setSaving(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const stats = [
    { label: 'Total usuarios', value: total, color: '#1565C0' },
    { label: 'Admins', value: usuarios.filter(u => u.roles?.nombre === 'admin').length, color: '#6a1b9a' },
    { label: 'Operadores', value: usuarios.filter(u => u.roles?.nombre === 'operador').length, color: '#2E7D32' },
    { label: 'Clientes', value: usuarios.filter(u => u.roles?.nombre === 'cliente').length, color: '#e65100' },
  ]

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--subtle)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Buscador + botón */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text" placeholder="Buscar por nombre o email..." value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
            style={{ padding: '0.65rem 1rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', width: '260px', outline: 'none' }}
          />
          <button onClick={handleBuscar} style={{ padding: '0.65rem 1rem', background: 'var(--secondary)', border: '1.5px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>Buscar</button>
          {search && <button onClick={() => { setSearch(''); setPage(1); cargar() }} style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding: '0.65rem 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--subtle)' }}><Icons.X size={13} /> Limpiar</button>}
        </div>
        <button onClick={() => { setShowForm(true); setForm(emptyForm); setError(null) }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading ? <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['Usuario', 'Email', 'Rol', 'Registrado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0
                ? <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin usuarios</td></tr>
                : usuarios.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                          {u.nombre?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge value={u.roles?.nombre || '–'} colorMap={ROLE_COLORS} />
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('es') : '–'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => handleDelete(u.id)} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #c62828', color: '#c62828', background: 'transparent' }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {showForm && (
        <Modal onClose={() => setShowForm(false)} maxWidth="440px">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Nuevo usuario</h3>
          {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Nombre *',     key: 'nombre' },
              { label: 'Email *',      key: 'email',    type: 'email' },
              { label: 'Contraseña *', key: 'password', type: 'password' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
                <input type={f.type || 'text'} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Rol *</label>
              <select value={form.rol_id} onChange={e => setForm(p => ({ ...p, rol_id: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
                <option value="">Seleccionar rol</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={handleSubmit} disabled={saving}
              style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Creando...' : 'Crear usuario'}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminUsuarios
