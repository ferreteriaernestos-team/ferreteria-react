import { useState, useEffect } from 'react'
import { getDescuentos, createDescuento, updateDescuento, deleteDescuento } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'

// Prisma enum: descuentos_tipo { PORCENTAJE, VALOR_FIJO }
// Prisma fields: nombre, tipo, valor, activo, fecha_inicio, fecha_fin
const emptyForm = { nombre: '', tipo: 'PORCENTAJE', valor: '', fecha_inicio: '', fecha_fin: '' }

function AdminDescuentos() {
  const [descuentos, setDescuentos] = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)
  const limit = 10

  useEffect(() => {
    setLoading(true)
    getDescuentos({ page, limit })
      .then(r => {
        console.log('[Descuentos]', r.data)
        setDescuentos(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => setError('Error al cargar descuentos'))
      .finally(() => setLoading(false))
  }, [page])

  function handleEdit(d) {
    setEditItem(d)
    setForm({
      nombre:      d.nombre || '',
      tipo:        d.tipo   || 'PORCENTAJE',
      valor:       d.valor  ?? '',
      fecha_inicio: d.fecha_inicio ? String(d.fecha_inicio).split('T')[0] : '',
      fecha_fin:    d.fecha_fin    ? String(d.fecha_fin).split('T')[0]    : '',
    })
    setShowForm(true)
  }

  async function handleDesactivar(id) {
    try {
      await deleteDescuento(id)
      setDescuentos(prev => prev.map(d => d.id === id ? { ...d, activo: false } : d))
    } catch { alert('No se pudo desactivar') }
  }

  async function handleSubmit() {
    if (!form.nombre || !form.valor) return setError('Nombre y valor son requeridos')
    setSaving(true); setError(null)
    try {
      const payload = {
        nombre:       form.nombre,
        tipo:         form.tipo,
        valor:        parseFloat(form.valor),
        fecha_inicio: form.fecha_inicio || undefined,
        fecha_fin:    form.fecha_fin    || undefined,
      }
      if (editItem) {
        const { data } = await updateDescuento(editItem.id, payload)
        setDescuentos(prev => prev.map(d => d.id === editItem.id ? (data?.descuento || data) : d))
      } else {
        const { data } = await createDescuento(payload)
        setDescuentos(prev => [data?.descuento || data, ...prev])
      }
      setShowForm(false); setEditItem(null); setForm(emptyForm)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Nuevo descuento
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading ? <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['Nombre', 'Tipo', 'Valor', 'Desde', 'Hasta', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {descuentos.length === 0
                ? <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin descuentos</td></tr>
                : descuentos.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{d.nombre}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{d.tipo === 'VALOR_FIJO' ? 'Valor fijo' : 'Porcentaje'}</td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{d.tipo === 'PORCENTAJE' ? `${d.valor}%` : `$${parseFloat(d.valor || 0).toFixed(2)}`}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{d.fecha_inicio ? new Date(d.fecha_inicio).toLocaleDateString('es') : '–'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{d.fecha_fin    ? new Date(d.fecha_fin).toLocaleDateString('es')    : '–'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: d.activo ? '#e8f5e9' : '#f5f5f5', color: d.activo ? '#2E7D32' : '#555' }}>
                        {d.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(d)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}>Editar</button>
                        {d.activo && (
                          <button onClick={() => handleDesactivar(d.id)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #c62828', color: '#c62828', background: 'transparent' }}>Desactivar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
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
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 800, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '460px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>{editItem ? 'Editar descuento' : 'Nuevo descuento'}</h3>
            {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Nombre *</label>
                <input type="text" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Tipo *</label>
                  <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="VALOR_FIJO">Valor fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Valor *</label>
                  <input type="number" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} min="0" step="0.01"
                    style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[{ label: 'Fecha inicio', key: 'fecha_inicio' }, { label: 'Fecha fin', key: 'fecha_fin' }].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
                    <input type="date" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
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

export default AdminDescuentos
