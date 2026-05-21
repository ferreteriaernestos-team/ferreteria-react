import { useState, useEffect } from 'react'
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'

// Prisma fields: nombre, contacto, email, telefono, direccion, nit
const emptyForm = { nombre: '', contacto: '', email: '', telefono: '', direccion: '', nit: '' }

function AdminProveedores() {
  const [proveedores, setProveedores] = useState([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [editItem, setEditItem]       = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)
  const limit = 10

  useEffect(() => {
    setLoading(true)
    getProveedores({ page, limit })
      .then(r => {
        console.log('[Proveedores]', r.data)
        setProveedores(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => setError('Error al cargar proveedores'))
      .finally(() => setLoading(false))
  }, [page])

  function handleEdit(p) {
    setEditItem(p)
    setForm({ nombre: p.nombre || '', contacto: p.contacto || '', email: p.email || '', telefono: p.telefono || '', direccion: p.direccion || '', nit: p.nit || '' })
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este proveedor?')) return
    try {
      await deleteProveedor(id)
      setProveedores(prev => prev.filter(p => p.id !== id))
    } catch { alert('No se pudo eliminar') }
  }

  async function handleSubmit() {
    if (!form.nombre) return setError('El nombre es requerido')
    setSaving(true); setError(null)
    try {
      if (editItem) {
        const { data } = await updateProveedor(editItem.id, form)
        setProveedores(prev => prev.map(p => p.id === editItem.id ? (data?.data || data) : p))
      } else {
        const { data } = await createProveedor(form)
        setProveedores(prev => [data?.data || data, ...prev])
      }
      setShowForm(false); setEditItem(null); setForm(emptyForm)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const fields = [{ label: 'Nombre', key: 'nombre' }, { label: 'Contacto', key: 'contacto' }, { label: 'Email', key: 'email', type: 'email' }, { label: 'Teléfono', key: 'telefono' }, { label: 'Dirección', key: 'direccion' }, { label: 'NIT', key: 'nit' }]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Nuevo proveedor
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading ? <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['Nombre', 'Contacto', 'Email', 'Teléfono', 'NIT', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proveedores.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin proveedores</td></tr>
              ) : proveedores.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{p.nombre}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{p.contacto || '–'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{p.email || '–'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{p.telefono || '–'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{p.nit || '–'}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(p)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}>Editar</button>
                      <button onClick={() => handleDelete(p.id)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #c62828', color: '#c62828', background: 'transparent' }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer' }}>Anterior</button>
          <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer' }}>Siguiente</button>
        </div>
      )}

      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 700 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 800, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>{editItem ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
            {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {fields.map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
                  <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Guardando...' : editItem ? 'Guardar' : 'Crear'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminProveedores
