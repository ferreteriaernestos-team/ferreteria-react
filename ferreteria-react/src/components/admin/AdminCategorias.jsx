import { useState, useEffect } from 'react'
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../services/api'
import { toArr } from '../../utils/parseResponse'

// Prisma fields: nombre, descripcion, activo
const emptyForm = { nombre: '', descripcion: '' }

function AdminCategorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)

  useEffect(() => {
    getCategorias()
      .then(r => {
        console.log('[Categorias]', r.data)
        setCategorias(toArr(r.data).map(c => ({ ...c, activo: c.activo ?? true })))
      })
      .catch(() => setError('Error al cargar categorías'))
      .finally(() => setLoading(false))
  }, [])

  function handleEdit(cat) {
    setEditItem(cat)
    setForm({ nombre: cat.nombre || '', descripcion: cat.descripcion || '' })
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('¿Desactivar esta categoría? Podrás reactivarla después.')) return
    try {
      await deleteCategoria(id)
      setCategorias(prev => prev.map(c => c.id === id ? { ...c, activo: false } : c))
    } catch {
      alert('No se pudo eliminar')
    }
  }

  async function handleReactivar(cat) {
    try {
      const { data } = await updateCategoria(cat.id, { nombre: cat.nombre, descripcion: cat.descripcion, activo: true })
      setCategorias(prev => prev.map(c => c.id === cat.id ? { ...(data?.categoria || data), activo: true } : c))
    } catch {
      alert('No se pudo reactivar')
    }
  }

  async function handleSubmit() {
    if (!form.nombre) return setError('El nombre es requerido')
    setSaving(true); setError(null)
    try {
      if (editItem) {
        const { data } = await updateCategoria(editItem.id, form)
        setCategorias(prev => prev.map(c => c.id === editItem.id ? { ...(data?.categoria || data), activo: true } : c))
      } else {
        const { data } = await createCategoria(form)
        setCategorias(prev => [...prev, { ...(data?.categoria || data), activo: true }])
      }
      setShowForm(false); setEditItem(null); setForm(emptyForm)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar'
      const yaExiste = msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('duplicad')
      setError(yaExiste
        ? `${msg}. Si la categoría fue desactivada, búscala en la sección "Inactivas" y usa "Reactivar".`
        : msg)
    } finally {
      setSaving(false)
    }
  }

  const activas   = categorias.filter(c => c.activo !== false)
  const inactivas = categorias.filter(c => c.activo === false)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Nueva categoría
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['ID', 'Nombre', 'Descripción', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activas.length === 0 && inactivas.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin categorías</td></tr>
              ) : (
                <>
                  {activas.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{c.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{c.nombre}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{c.descripcion || '–'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: '#e8f5e9', color: '#2E7D32' }}>Activa</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEdit(c)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}>Editar</button>
                          <button onClick={() => handleDelete(c.id)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #c62828', color: '#c62828', background: 'transparent' }}>Desactivar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {inactivas.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', opacity: 0.55 }}>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{c.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 600, textDecoration: 'line-through' }}>{c.nombre}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{c.descripcion || '–'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: '#f5f5f5', color: '#555' }}>Inactiva</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => handleReactivar(c)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #2E7D32', color: '#2E7D32', background: 'transparent' }}>Reactivar</button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 700 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 800, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>{editItem ? 'Editar categoría' : 'Nueva categoría'}</h3>
            {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[{ label: 'Nombre', key: 'nombre' }, { label: 'Descripción', key: 'descripcion' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
                  <input type="text" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Guardando...' : editItem ? 'Guardar' : 'Crear'}
              </button>
              <button onClick={() => { setShowForm(false); setError(null) }} style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminCategorias
