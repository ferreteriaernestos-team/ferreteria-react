import { useState, useEffect } from 'react'
import { getPedidos, getPedido, actualizarEstadoPedido, confirmarPedido, cancelarPedido } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'

// Enums exactos del schema Prisma
const ESTADOS = ['PENDIENTE_CONFIRMACION', 'CONFIRMADO', 'EN_RUTA', 'ENTREGADO', 'CANCELADO']

const STATUS_COLORS = {
  PENDIENTE_CONFIRMACION: { bg: '#fff3e0', color: '#e65100',  label: 'Pendiente' },
  CONFIRMADO:             { bg: '#e8f5e9', color: '#2E7D32',  label: 'Confirmado' },
  EN_RUTA:                { bg: '#e3f2fd', color: '#1565C0',  label: 'En ruta' },
  ENTREGADO:              { bg: '#e8f5e9', color: '#2E7D32',  label: 'Entregado' },
  CANCELADO:              { bg: '#ffebee', color: '#c62828',  label: 'Cancelado' },
}

function AdminPedidos() {
  const [pedidos, setPedidos]   = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [filterStatus, setFilterStatus] = useState('TODOS')
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState(null)
  const [detail, setDetail]     = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const limit = 10

  useEffect(() => {
    setLoading(true)
    const params = { page, limit }
    if (filterStatus !== 'TODOS') params.estado = filterStatus
    getPedidos(params)
      .then(r => {
        console.log('[Pedidos]', r.data)
        setPedidos(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, filterStatus])

  async function changeStatus(id, estado) {
    setUpdating(id)
    try {
      await actualizarEstadoPedido(id, { estado })
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p))
    } catch { alert('No se pudo actualizar el estado') }
    finally { setUpdating(null) }
  }

  async function handleConfirmar(id) {
    setUpdating(id)
    try {
      await confirmarPedido(id)
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: 'CONFIRMADO' } : p))
    } catch { alert('No se pudo confirmar') }
    finally { setUpdating(null) }
  }

  async function handleCancelar(id) {
    if (!confirm('¿Cancelar este pedido?')) return
    setUpdating(id)
    try {
      await cancelarPedido(id)
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: 'CANCELADO' } : p))
      if (detail?.id === id) setDetail(prev => ({ ...prev, estado: 'CANCELADO' }))
    } catch { alert('No se pudo cancelar') }
    finally { setUpdating(null) }
  }

  async function handleVerDetalle(id) {
    setDetailLoading(true)
    setDetail({ id })
    try {
      const { data } = await getPedido(id)
      console.log('[Pedido detalle]', data)
      setDetail(data?.pedido || data)
    } catch {
      setDetail(null)
      alert('No se pudo cargar el detalle del pedido')
    } finally {
      setDetailLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['TODOS', ...ESTADOS].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); setPage(1) }}
            style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: filterStatus === s ? 'var(--accent)' : 'var(--secondary)', color: filterStatus === s ? '#fff' : 'var(--muted-fg)' }}>
            {STATUS_COLORS[s]?.label || 'Todos'}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading ? <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando pedidos...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['ID', 'Cliente', 'Total', 'Dirección', 'Fecha', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0
                ? <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin pedidos</td></tr>
                : pedidos.map(p => {
                  const estado = p.estado || 'PENDIENTE_CONFIRMACION'
                  // Prisma: clientes relation (snake_case)
                  const clienteNombre = p.clientes?.nombre || p.cliente?.nombre || '–'
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem' }}>#{p.id}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>{clienteNombre}</td>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>${parseFloat(p.total || 0).toFixed(2)}</td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.direccion_entrega || '–'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)', whiteSpace: 'nowrap' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('es') : '–'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: STATUS_COLORS[estado]?.bg || '#f5f5f5', color: STATUS_COLORS[estado]?.color || '#555', whiteSpace: 'nowrap' }}>
                          {STATUS_COLORS[estado]?.label || estado}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button onClick={() => handleVerDetalle(p.id)}
                            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}>
                            Ver
                          </button>
                          <select value={estado} disabled={updating === p.id}
                            onChange={e => changeStatus(p.id, e.target.value)}
                            style={{ padding: '0.35rem 0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', outline: 'none' }}>
                            {ESTADOS.map(s => <option key={s} value={s}>{STATUS_COLORS[s]?.label || s}</option>)}
                          </select>
                          {estado === 'PENDIENTE_CONFIRMACION' && (
                            <button onClick={() => handleConfirmar(p.id)} disabled={updating === p.id}
                              style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: '#e8f5e9', color: '#2E7D32' }}>
                              ✓
                            </button>
                          )}
                          {!['CANCELADO', 'ENTREGADO'].includes(estado) && (
                            <button onClick={() => handleCancelar(p.id)} disabled={updating === p.id}
                              style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: '#ffebee', color: '#c62828' }}>
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
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

      {/* Modal detalle del pedido */}
      {detail && (
        <>
          <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 700 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 800, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '580px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>

            {detailLoading ? (
              <p style={{ textAlign: 'center', color: 'var(--subtle)', padding: '2rem' }}>Cargando detalle...</p>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>Pedido #{detail.id}</h3>
                  {detail.estado && (
                    <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: STATUS_COLORS[detail.estado]?.bg || '#f5f5f5', color: STATUS_COLORS[detail.estado]?.color || '#555' }}>
                      {STATUS_COLORS[detail.estado]?.label || detail.estado}
                    </span>
                  )}
                </div>

                {/* Info del cliente y pedido */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Cliente',    value: detail.clientes?.nombre || detail.cliente?.nombre || 'Consumidor final' },
                    { label: 'Teléfono',   value: detail.clientes?.telefono || detail.cliente?.telefono || '–' },
                    { label: 'Fecha',      value: detail.created_at ? new Date(detail.created_at).toLocaleString('es') : '–' },
                    { label: 'Total',      value: `$${parseFloat(detail.total || 0).toFixed(2)}` },
                    { label: 'Dirección', value: detail.direccion_entrega || '–', full: true },
                  ].map((f, i) => (
                    <div key={i} style={f.full ? { gridColumn: '1 / -1' } : {}}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--subtle)', marginBottom: '0.2rem' }}>{f.label}</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{f.value}</p>
                    </div>
                  ))}
                </div>

                {/* Productos del pedido */}
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-fg)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Productos</p>
                {toArr(detail.detalle_pedido).length === 0 ? (
                  <p style={{ color: 'var(--subtle)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Sin productos registrados</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--secondary)' }}>
                        {['Producto', 'Cant.', 'Precio unit.', 'Subtotal'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {toArr(detail.detalle_pedido).map((d, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 500 }}>
                            {d.productos?.nombre || d.producto?.nombre || '–'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>{d.cantidad}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>${parseFloat(d.precio_unitario || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>${parseFloat(d.subtotal || (d.cantidad * d.precio_unitario) || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: 'var(--secondary)' }}>
                        <td colSpan={3} style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.875rem', textAlign: 'right' }}>Total</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '1rem' }}>${parseFloat(detail.total || 0).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  {detail.estado === 'PENDIENTE_CONFIRMACION' && (
                    <button onClick={() => { handleConfirmar(detail.id); setDetail(prev => ({ ...prev, estado: 'CONFIRMADO' })) }}
                      style={{ padding: '0.65rem 1.25rem', background: '#e8f5e9', color: '#2E7D32', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                      Confirmar pedido
                    </button>
                  )}
                  {!['CANCELADO', 'ENTREGADO'].includes(detail.estado) && (
                    <button onClick={() => handleCancelar(detail.id)}
                      style={{ padding: '0.65rem 1.25rem', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                      Cancelar pedido
                    </button>
                  )}
                  <button onClick={() => setDetail(null)}
                    style={{ padding: '0.65rem 1.25rem', background: 'var(--secondary)', color: 'var(--fg)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminPedidos
