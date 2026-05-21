import { useState, useEffect } from 'react'
import { getVentas, cancelarVenta, createVenta, getProductos, getClientes, getDescuentos, getEstadoCaja, abrirCaja } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import Modal from './shared/Modal'
import Pagination from './shared/Pagination'
import * as Icons from './shared/Icons'

// Prisma enums: ventas_estado { COMPLETADA, CANCELADA }
// ventas_metodo_pago { EFECTIVO, TARJETA, TRANSFERENCIA }
const STATUS_COLORS = {
  COMPLETADA: { bg: '#e8f5e9', color: '#2E7D32' },
  CANCELADA:  { bg: '#ffebee', color: '#c62828' },
}
const METODOS = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' }

const emptyVenta = {
  cliente_id: '',
  metodo_pago: 'EFECTIVO',
  descuento_id: '',
  detalles: [{ producto_id: '', cantidad: 1, precio_unitario: '' }],
}

function buildReceiptHtml({ id, clienteNombre, metodoPago, items, descuentoNombre, descuentoMonto, total, fecha }) {
  const subtotal = total + descuentoMonto
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Comprobante #${id}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;font-size:12px;width:300px;margin:0 auto;padding:16px}
.c{text-align:center}.b{font-weight:bold}
hr{border:none;border-top:1px dashed #000;margin:8px 0}
table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}
.r{text-align:right}h1{font-size:16px}
@media print{body{width:80mm}}
</style></head><body>
<div class="c"><h1>FERRETERÍA</h1><p>Comprobante de Venta</p>
<p class="b">No. ${id}</p>
<p>${fecha}</p></div>
<hr>
<p>Cliente: <b>${clienteNombre}</b></p>
<p>Método: <b>${metodoPago}</b></p>
<hr>
<table>
<tr><td><b>Producto</b></td><td class="r"><b>Cant</b></td><td class="r"><b>P.Unit</b></td><td class="r"><b>Total</b></td></tr>
${items.map(i => `<tr><td>${i.nombre}</td><td class="r">${i.cantidad}</td><td class="r">$${parseFloat(i.precio).toFixed(2)}</td><td class="r">$${parseFloat(i.subtotal).toFixed(2)}</td></tr>`).join('')}
</table>
<hr>
<table>
<tr><td>Subtotal:</td><td class="r">$${subtotal.toFixed(2)}</td></tr>
${descuentoMonto > 0 ? `<tr><td>Descuento${descuentoNombre ? ` (${descuentoNombre})` : ''}:</td><td class="r">-$${descuentoMonto.toFixed(2)}</td></tr>` : ''}
<tr><td class="b">TOTAL:</td><td class="r b">$${total.toFixed(2)}</td></tr>
</table>
<hr>
<div class="c"><p>¡Gracias por su compra!</p></div>
</body></html>`
}

function openPrintWindow(html) {
  const win = window.open('', '_blank', 'width=420,height=620')
  if (win) {
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }
}

// Print from form data right after creating a sale
function printReceipt(venta, form, prods, clients, descs) {
  const cliente   = clients.find(c => c.id === parseInt(form.cliente_id))
  const descuento = descs.find(d => d.id === parseInt(form.descuento_id))
  const items = form.detalles.map(d => {
    const prod = prods.find(p => p.id === parseInt(d.producto_id))
    const qty  = parseInt(d.cantidad) || 0
    const prc  = parseFloat(d.precio_unitario) || 0
    return { nombre: prod?.nombre || `Producto #${d.producto_id}`, cantidad: qty, precio: prc, subtotal: qty * prc }
  })
  const subtotal   = items.reduce((s, i) => s + i.subtotal, 0)
  const descMonto  = descuento
    ? (descuento.tipo === 'PORCENTAJE' ? subtotal * parseFloat(descuento.valor) / 100 : parseFloat(descuento.valor))
    : 0
  const total = Math.max(0, subtotal - descMonto)
  openPrintWindow(buildReceiptHtml({
    id:              venta?.id || '–',
    clienteNombre:   cliente?.nombre || 'Consumidor final',
    metodoPago:      METODOS[form.metodo_pago] || form.metodo_pago,
    items,
    descuentoNombre: descuento?.nombre || '',
    descuentoMonto:  descMonto,
    total,
    fecha:           new Date().toLocaleString('es'),
  }))
}

// Print from stored venta object (for existing sales)
function printReceiptFromVenta(v) {
  const items = (v.detalle_venta || []).map(d => ({
    nombre:   d.productos?.nombre || `Producto #${d.producto_id}`,
    cantidad: d.cantidad,
    precio:   d.precio_unitario,
    subtotal: d.subtotal,
  }))
  const descuentoMonto = parseFloat(v.descuento_monto || 0)
  openPrintWindow(buildReceiptHtml({
    id:              v.id,
    clienteNombre:   v.clientes?.nombre || 'Consumidor final',
    metodoPago:      METODOS[v.metodo_pago] || v.metodo_pago || '–',
    items,
    descuentoNombre: v.descuentos?.nombre || '',
    descuentoMonto,
    total:           parseFloat(v.total || 0),
    fecha:           v.created_at ? new Date(v.created_at).toLocaleString('es') : new Date().toLocaleString('es'),
  }))
}

function AdminVentas() {
  const [ventas, setVentas]           = useState([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [loading, setLoading]         = useState(true)
  const [detail, setDetail]           = useState(null)
  const limit = 10

  // — Nueva venta
  const [showVentaForm, setShowVentaForm] = useState(false)
  const [ventaForm, setVentaForm]         = useState(emptyVenta)
  const [ventaProds, setVentaProds]       = useState([])
  const [ventaClientes, setVentaClientes] = useState([])
  const [ventaDescs, setVentaDescs]       = useState([])
  const [ventaSaving, setVentaSaving]     = useState(false)
  const [ventaError, setVentaError]       = useState(null)

  // — Abrir caja inline (cuando no hay caja abierta)
  const [showAbrirCaja, setShowAbrirCaja] = useState(false)
  const [montoCaja, setMontoCaja]         = useState('')
  const [abriendo, setAbriendo]           = useState(false)
  const [cajaError, setCajaError]         = useState(null)

  useEffect(() => {
    setLoading(true)
    getVentas({ page, limit })
      .then(r => {
        console.log('[Ventas]', r.data)
        setVentas(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    if (!showVentaForm) return
    Promise.all([
      getProductos({ limit: 200 }).catch(() => ({ data: [] })),
      getClientes({ limit: 200 }).catch(() => ({ data: [] })),
      getDescuentos({ limit: 50 }).catch(() => ({ data: [] })),
    ]).then(([p, c, d]) => {
      setVentaProds(toArr(p.data))
      setVentaClientes(toArr(c.data))
      setVentaDescs(toArr(d.data).filter(x => x.activo))
    })
  }, [showVentaForm])

  async function handleCancelar(id) {
    if (!confirm('¿Cancelar esta venta?')) return
    try {
      await cancelarVenta(id)
      setVentas(prev => prev.map(v => v.id === id ? { ...v, estado: 'CANCELADA' } : v))
    } catch { alert('No se pudo cancelar') }
  }

  // — Detalle helpers
  function addDetalle() {
    setVentaForm(p => ({ ...p, detalles: [...p.detalles, { producto_id: '', cantidad: 1, precio_unitario: '' }] }))
  }
  function removeDetalle(i) {
    setVentaForm(p => ({ ...p, detalles: p.detalles.filter((_, idx) => idx !== i) }))
  }
  function updateDetalle(i, key, value) {
    setVentaForm(p => {
      const detalles = p.detalles.map((d, idx) => {
        if (idx !== i) return d
        const updated = { ...d, [key]: value }
        // Auto-fill precio when product changes
        if (key === 'producto_id') {
          const prod = ventaProds.find(pr => pr.id === parseInt(value))
          if (prod) updated.precio_unitario = String(prod.precio_venta || '')
        }
        return updated
      })
      return { ...p, detalles }
    })
  }

  // — Totals
  const ventaSubtotal = ventaForm.detalles.reduce(
    (s, d) => s + (parseInt(d.cantidad) || 0) * (parseFloat(d.precio_unitario) || 0), 0
  )
  const selectedDesc  = ventaDescs.find(d => d.id === parseInt(ventaForm.descuento_id))
  const ventaDescMonto = selectedDesc
    ? (selectedDesc.tipo === 'PORCENTAJE' ? ventaSubtotal * selectedDesc.valor / 100 : selectedDesc.valor)
    : 0
  const ventaTotal = Math.max(0, ventaSubtotal - ventaDescMonto)

  async function handleOpenVentaForm() {
    try {
      const { data } = await getEstadoCaja()
      const caja = data?.data || data
      if (!caja || !caja.id) {
        // No hay caja abierta → mostrar modal para abrirla
        setMontoCaja(''); setCajaError(null)
        setShowAbrirCaja(true)
        return
      }
    } catch {
      // Si falla la consulta igual dejamos pasar (el backend lo validará)
    }
    setShowVentaForm(true)
    setVentaForm(emptyVenta)
    setVentaError(null)
  }

  async function handleAbrirCaja() {
    const monto = parseFloat(montoCaja)
    if (isNaN(monto) || monto < 0) return setCajaError('Ingresa un monto inicial válido')
    setAbriendo(true); setCajaError(null)
    try {
      await abrirCaja({ monto_inicial: monto })
      setShowAbrirCaja(false)
      setShowVentaForm(true)
      setVentaForm(emptyVenta)
      setVentaError(null)
    } catch (err) {
      setCajaError(err.response?.data?.message || 'No se pudo abrir la caja')
    } finally { setAbriendo(false) }
  }

  async function handleVentaSubmit() {
    if (ventaForm.detalles.some(d => !d.producto_id || !d.cantidad || !d.precio_unitario)) {
      return setVentaError('Completa todos los productos con cantidad y precio')
    }
    setVentaSaving(true); setVentaError(null)
    try {
      const payload = {
        cliente_id:   ventaForm.cliente_id ? parseInt(ventaForm.cliente_id) : undefined,
        metodo_pago:  ventaForm.metodo_pago,
        descuento_id: ventaForm.descuento_id ? parseInt(ventaForm.descuento_id) : undefined,
        productos: ventaForm.detalles.map(d => ({
          producto_id: parseInt(d.producto_id),
          cantidad:    parseInt(d.cantidad),
        })),
      }
      const { data } = await createVenta(payload)
      const nuevaVenta = data?.data || data
      setVentas(prev => [nuevaVenta, ...prev])
      const formSnapshot = { ...ventaForm }
      setShowVentaForm(false)
      setVentaForm(emptyVenta)
      printReceipt(nuevaVenta, formSnapshot, ventaProds, ventaClientes, ventaDescs)
    } catch (err) {
      setVentaError(err.response?.data?.message || 'Error al registrar venta')
    } finally {
      setVentaSaving(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button onClick={handleOpenVentaForm}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Realizar venta
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading ? <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando ventas...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['ID', 'Cliente', 'Total', 'Descuento', 'Método', 'Fecha', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0
                ? <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin ventas</td></tr>
                : ventas.map(v => {
                  const estado = v.estado || 'COMPLETADA'
                  const clienteNombre = v.clientes?.nombre || 'Consumidor final'
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.8rem' }}>#{v.id}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{clienteNombre}</td>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>${parseFloat(v.total || 0).toFixed(2)}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {parseFloat(v.descuento_monto || 0) > 0
                          ? <div>
                              <span style={{ color: '#2E7D32', fontWeight: 600 }}>-${parseFloat(v.descuento_monto).toFixed(2)}</span>
                              {v.descuentos?.nombre && <p style={{ fontSize: '0.72rem', color: 'var(--subtle)', marginTop: '0.1rem' }}>{v.descuentos.nombre}</p>}
                            </div>
                          : <span style={{ color: 'var(--subtle)' }}>–</span>
                        }
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{METODOS[v.metodo_pago] || v.metodo_pago || '–'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--subtle)', whiteSpace: 'nowrap' }}>{v.created_at ? new Date(v.created_at).toLocaleDateString('es') : '–'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: STATUS_COLORS[estado]?.bg || '#f5f5f5', color: STATUS_COLORS[estado]?.color || '#555' }}>
                          {estado}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button onClick={() => setDetail(v)} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Icons.FileText size={12} /> Ver
                          </button>
                          <button onClick={() => printReceiptFromVenta(v)} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #1565C0', color: '#1565C0', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Icons.Inbox size={12} /> Comprobante
                          </button>
                          {estado !== 'CANCELADA' && (
                            <button onClick={() => handleCancelar(v.id)} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #c62828', color: '#c62828', background: 'transparent' }}>Cancelar</button>
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal detalle venta existente */}
      {detail && (
        <Modal onClose={() => setDetail(null)} maxWidth="540px">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1rem' }}>Venta #{detail.id}</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <span>Cliente: <strong>{detail.clientes?.nombre || 'Consumidor final'}</strong></span>
              <span>Método: <strong>{METODOS[detail.metodo_pago] || '–'}</strong></span>
              <span>Total: <strong>${parseFloat(detail.total || 0).toFixed(2)}</strong></span>
            </div>
            {toArr(detail.detalle_venta).length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--secondary)' }}>
                    {['Producto', 'Cant.', 'Precio', 'Subtotal'].map(h => (
                      <th key={h} style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {toArr(detail.detalle_venta).map((d, i) => (
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
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button onClick={() => setDetail(null)} style={{ background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
            </div>
        </Modal>
      )}

      {/* Modal nueva venta */}
      {showVentaForm && (
        <Modal onClose={() => setShowVentaForm(false)} maxWidth="680px">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Realizar venta</h3>
            {ventaError && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem' }}>{ventaError}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Cliente (opcional)</label>
                <select value={ventaForm.cliente_id} onChange={e => setVentaForm(p => ({ ...p, cliente_id: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
                  <option value="">Consumidor final</option>
                  {ventaClientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Método de pago *</label>
                <select value={ventaForm.metodo_pago} onChange={e => setVentaForm(p => ({ ...p, metodo_pago: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
                  {Object.entries(METODOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Descuento (opcional)</label>
              <select value={ventaForm.descuento_id} onChange={e => setVentaForm(p => ({ ...p, descuento_id: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
                <option value="">Sin descuento</option>
                {ventaDescs.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} — {d.tipo === 'PORCENTAJE' ? `${d.valor}%` : `$${d.valor}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Productos */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Productos *</label>
                <button onClick={addDetalle} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>+ Agregar</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.35rem' }}>
                {['Producto', 'Cant.', 'Precio unit.', ''].map((h, i) => (
                  <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</span>
                ))}
              </div>
              {ventaForm.detalles.map((d, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <select value={d.producto_id} onChange={e => updateDetalle(i, 'producto_id', e.target.value)}
                    style={{ padding: '0.55rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}>
                    <option value="">Seleccionar producto</option>
                    {ventaProds.map(p => <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>)}
                  </select>
                  <input type="number" placeholder="Cant." value={d.cantidad} min="1"
                    onChange={e => updateDetalle(i, 'cantidad', e.target.value)}
                    style={{ padding: '0.55rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }} />
                  <input type="number" placeholder="Precio" value={d.precio_unitario} min="0" step="0.01"
                    onChange={e => updateDetalle(i, 'precio_unitario', e.target.value)}
                    style={{ padding: '0.55rem', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }} />
                  {ventaForm.detalles.length > 1
                    ? <button onClick={() => removeDetalle(i)} style={{ padding: '0.55rem', border: 'none', background: '#ffebee', color: '#c62828', borderRadius: '6px', cursor: 'pointer', display:'flex', alignItems:'center' }}><Icons.X size={14} /></button>
                    : <span />
                  }
                </div>
              ))}
            </div>

            {/* Resumen de totales */}
            <div style={{ background: 'var(--secondary)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--subtle)' }}>Subtotal</span>
                <span>${ventaSubtotal.toFixed(2)}</span>
              </div>
              {ventaDescMonto > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--subtle)' }}>Descuento</span>
                  <span style={{ color: '#2E7D32' }}>-${ventaDescMonto.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.35rem' }}>
                <span>Total</span>
                <span>${ventaTotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleVentaSubmit} disabled={ventaSaving}
                style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                {ventaSaving ? 'Procesando...' : `Confirmar venta — $${ventaTotal.toFixed(2)}`}
              </button>
              <button onClick={() => setShowVentaForm(false)}
                style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
        </Modal>
      )}

      {/* Modal: abrir caja antes de vender */}
      {showAbrirCaja && (
        <Modal onClose={() => setShowAbrirCaja(false)} maxWidth="400px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: '#fff3e0', display: 'flex' }}>
              <Icons.Wallet size={22} color="#e65100" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Caja cerrada</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--subtle)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            No tienes una caja abierta. Ábrela ahora para poder registrar ventas.
          </p>
          {cajaError && (
            <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem', background: '#ffebee', padding: '0.6rem', borderRadius: '6px' }}>{cajaError}</p>
          )}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Monto inicial en caja ($)</label>
            <input
              type="number" value={montoCaja} onChange={e => setMontoCaja(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAbrirCaja()}
              placeholder="0.00" min="0" step="0.01" autoFocus
              style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleAbrirCaja} disabled={abriendo}
              style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              {abriendo ? 'Abriendo...' : 'Abrir caja y continuar'}
            </button>
            <button onClick={() => setShowAbrirCaja(false)}
              style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminVentas
