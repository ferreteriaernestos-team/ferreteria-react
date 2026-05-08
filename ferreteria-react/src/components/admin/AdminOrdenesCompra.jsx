import { useState, useEffect } from 'react'
import { getOrdenesCompra, getOrdenCompra, createOrdenCompra, recibirOrdenCompra, getProveedores, getProductos } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'

// Prisma enum: ordenes_compra_estado { PENDIENTE, RECIBIDO, CANCELADO }
// Prisma fields: proveedor_id, estado, total, created_at
// Relations: proveedores.nombre, detalle_orden_compra[].productos.nombre, detalle_orden_compra[].precio_unitario
const emptyForm = { proveedor_id: '', observacion: '', detalles: [{ producto_id: '', cantidad: 1, precio_unitario: '' }] }

const STATUS_COLORS = {
  PENDIENTE:  { bg: '#fff3e0', color: '#e65100' },
  RECIBIDO:   { bg: '#e8f5e9', color: '#2E7D32' },
  CANCELADO:  { bg: '#ffebee', color: '#c62828' },
}

function AdminOrdenesCompra() {
  const [ordenes, setOrdenes]         = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos]     = useState([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [detail, setDetail]           = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)
  const limit = 10

  useEffect(() => {
    Promise.all([
      getProveedores({ limit: 200 }).catch(() => ({ data: [] })),
      getProductos({ limit: 200 }).catch(() => ({ data: [] })),
    ]).then(([pv, pr]) => {
      setProveedores(toArr(pv.data))
      setProductos(toArr(pr.data))
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    getOrdenesCompra({ page, limit })
      .then(r => {
        console.log('[OrdenesCompra]', r.data)
        setOrdenes(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  function addDetalle() {
    setForm(p => ({ ...p, detalles: [...p.detalles, { producto_id: '', cantidad: 1, precio_unitario: '' }] }))
  }

  function removeDetalle(i) {
    setForm(p => ({ ...p, detalles: p.detalles.filter((_, idx) => idx !== i) }))
  }

  function updateDetalle(i, key, value) {
    setForm(p => ({ ...p, detalles: p.detalles.map((d, idx) => idx === i ? { ...d, [key]: value } : d) }))
  }

  async function handleVerDetalle(id) {
    try {
      const { data } = await getOrdenCompra(id)
      console.log('[Orden detalle]', data)
      setDetail(data?.orden || data)
    } catch { alert('No se pudo cargar el detalle') }
  }

  async function handleRecibir(id) {
    if (!confirm('¿Marcar esta orden como recibida y actualizar el inventario?')) return
    try {
      await recibirOrdenCompra(id, {})
      setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado: 'RECIBIDO' } : o))
      if (detail?.id === id) setDetail(prev => ({ ...prev, estado: 'RECIBIDO' }))
    } catch { alert('No se pudo recibir la orden') }
  }

  async function handleSubmit() {
    if (!form.proveedor_id) return setError('Selecciona un proveedor')
    if (form.detalles.some(d => !d.producto_id || !d.cantidad)) return setError('Completa todos los detalles')
    setSaving(true); setError(null)
    try {
      const payload = {
        proveedor_id: parseInt(form.proveedor_id),
        observacion: form.observacion || undefined,
        detalles: form.detalles.map(d => ({
          producto_id:    parseInt(d.producto_id),
          cantidad:       parseInt(d.cantidad),
          precio_unitario: parseFloat(d.precio_unitario) || 0,
        })),
      }
      const { data } = await createOrdenCompra(payload)
      setOrdenes(prev => [data?.orden || data, ...prev])
      setShowForm(false); setForm(emptyForm)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear orden')
    } finally { setSaving(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button onClick={() => { setShowForm(true); setForm(emptyForm) }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Nueva orden de compra
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading ? <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['#', 'Proveedor', 'Total', 'Estado', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin órdenes de compra</td></tr>
              ) : ordenes.map(o => {
                const estado = o.estado || 'PENDIENTE'
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem' }}>#{o.id}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>{o.proveedores?.nombre || '–'}</td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>${parseFloat(o.total || 0).toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: STATUS_COLORS[estado]?.bg || '#f5f5f5', color: STATUS_COLORS[estado]?.color || '#555' }}>
                        {estado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('es') : '–'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => handleVerDetalle(o.id)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}>Ver</button>
                        {estado === 'PENDIENTE' && (
                          <button onClick={() => handleRecibir(o.id)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: '#e8f5e9', color: '#2E7D32' }}>Recibir</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
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

      {/* Modal detalle */}
      {detail && (
        <>
          <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 700 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 800, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '560px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1rem' }}>Orden #{detail.id}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--subtle)', marginBottom: '1rem' }}>
              Proveedor: <strong>{detail.proveedores?.nombre || '–'}</strong> | Total: <strong>${parseFloat(detail.total || 0).toFixed(2)}</strong>
            </p>
            {toArr(detail.detalle_orden_compra).length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ background: 'var(--secondary)' }}>
                    {['Producto', 'Cant.', 'Precio unit.', 'Subtotal'].map(h => (
                      <th key={h} style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {toArr(detail.detalle_orden_compra).map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{d.productos?.nombre || '–'}</td>
                      <td style={{ padding: '0.75rem' }}>{d.cantidad}</td>
                      <td style={{ padding: '0.75rem' }}>${parseFloat(d.precio_unitario || 0).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>${parseFloat(d.subtotal || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {detail.estado === 'PENDIENTE' && (
                <button onClick={() => handleRecibir(detail.id)} style={{ padding: '0.65rem 1.25rem', background: '#e8f5e9', color: '#2E7D32', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Marcar como recibida</button>
              )}
              <button onClick={() => setDetail(null)} style={{ padding: '0.65rem 1.25rem', background: 'var(--secondary)', color: 'var(--fg)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </>
      )}

      {/* Modal nueva orden */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 700 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 800, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '600px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Nueva orden de compra</h3>
            {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Proveedor *</label>
                <select value={form.proveedor_id} onChange={e => setForm(p => ({ ...p, proveedor_id: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Observación</label>
                <input type="text" value={form.observacion} onChange={e => setForm(p => ({ ...p, observacion: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Productos *</label>
                  <button onClick={addDetalle} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>+ Agregar</button>
                </div>
                {form.detalles.map((d, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <select value={d.producto_id} onChange={e => updateDetalle(i, 'producto_id', e.target.value)}
                      style={{ padding: '0.55rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}>
                      <option value="">Producto</option>
                      {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <input type="number" placeholder="Cant." value={d.cantidad} onChange={e => updateDetalle(i, 'cantidad', e.target.value)} min="1"
                      style={{ padding: '0.55rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }} />
                    <input type="number" placeholder="Precio" value={d.precio_unitario} onChange={e => updateDetalle(i, 'precio_unitario', e.target.value)} min="0" step="0.01"
                      style={{ padding: '0.55rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }} />
                    {form.detalles.length > 1 && (
                      <button onClick={() => removeDetalle(i)} style={{ padding: '0.55rem', border: 'none', background: '#ffebee', color: '#c62828', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Creando...' : 'Crear orden'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminOrdenesCompra
