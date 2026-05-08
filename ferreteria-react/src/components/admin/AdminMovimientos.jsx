import { useState, useEffect } from 'react'
import { getMovimientos, createMovimiento, getProductos } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'

// Prisma enum: movimientos_inventario_tipo { ENTRADA, SALIDA, AJUSTE }
// Prisma fields: producto_id, usuario_id, tipo, cantidad, referencia, observacion, created_at
const TIPOS = ['ENTRADA', 'SALIDA', 'AJUSTE']
const emptyForm = { producto_id: '', tipo: 'ENTRADA', cantidad: '', referencia: '', observacion: '' }

function AdminMovimientos() {
  const [movimientos, setMovimientos] = useState([])
  const [productos, setProductos]     = useState([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm]               = useState(emptyForm)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)
  const limit = 15

  useEffect(() => {
    getProductos({ limit: 200 })
      .then(r => setProductos(toArr(r.data)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    getMovimientos({ page, limit })
      .then(r => {
        console.log('[Movimientos]', r.data)
        setMovimientos(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  async function handleSubmit() {
    if (!form.producto_id || !form.cantidad) return setError('Producto y cantidad son requeridos')
    setSaving(true); setError(null)
    try {
      const payload = {
        producto_id: parseInt(form.producto_id),
        tipo:        form.tipo,
        cantidad:    parseInt(form.cantidad),
        referencia:  form.referencia || undefined,
        observacion: form.observacion || undefined,
      }
      const { data } = await createMovimiento(payload)
      setMovimientos(prev => [data?.movimiento || data, ...prev])
      setShowForm(false); setForm(emptyForm)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar movimiento')
    } finally { setSaving(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const TIPO_COLORS = { ENTRADA: { bg: '#e8f5e9', color: '#2E7D32' }, SALIDA: { bg: '#ffebee', color: '#c62828' }, AJUSTE: { bg: '#fff3e0', color: '#e65100' } }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button onClick={() => { setShowForm(true); setForm(emptyForm) }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Registrar movimiento
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading ? <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['#', 'Producto', 'Tipo', 'Cantidad', 'Referencia', 'Usuario', 'Fecha'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0
                ? <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin movimientos</td></tr>
                : movimientos.map((m, i) => (
                  <tr key={m.id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{m.id}</td>
                    <td style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem' }}>{m.productos?.nombre || '–'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: TIPO_COLORS[m.tipo]?.bg || '#f5f5f5', color: TIPO_COLORS[m.tipo]?.color || '#555' }}>
                        {m.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: m.tipo === 'ENTRADA' ? '#2E7D32' : m.tipo === 'SALIDA' ? '#c62828' : '#e65100' }}>
                      {m.tipo === 'ENTRADA' ? '+' : m.tipo === 'SALIDA' ? '-' : '~'}{m.cantidad}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{m.referencia || m.observacion || '–'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{m.usuarios?.nombre || '–'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)', whiteSpace: 'nowrap' }}>{m.created_at ? new Date(m.created_at).toLocaleDateString('es') : '–'}</td>
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
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Registrar movimiento</h3>
            {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Producto *</label>
                <select value={form.producto_id} onChange={e => setForm(p => ({ ...p, producto_id: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Tipo *</label>
                  <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Cantidad *</label>
                  <input type="number" value={form.cantidad} onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} min="1"
                    style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              {[{ label: 'Referencia', key: 'referencia' }, { label: 'Observación', key: 'observacion' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
                  <input type="text" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Guardando...' : 'Registrar'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminMovimientos
