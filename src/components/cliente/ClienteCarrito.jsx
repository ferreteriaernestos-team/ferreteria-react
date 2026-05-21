import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { checkoutCarrito } from '../../services/api'

const ACCENT = '#e8781a'

export default function ClienteCarrito({ onPedidoCreado }) {
  const { cart, changeQty, removeFromCart, clearCart, sessionId, cliente_id, syncCart } = useCart()
  const { user } = useAuth()
  const [form, setForm]       = useState({ direccion: '', telefono: '', observaciones: '' })
  const [step, setStep]       = useState('carrito') // 'carrito' | 'checkout' | 'exito'
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [pedido, setPedido]   = useState(null)

  const items = cart.items || []

  async function handleCheckout(e) {
    e.preventDefault()
    if (!form.direccion.trim()) return setError('La dirección de entrega es requerida')
    if (!cliente_id && !form.telefono.trim()) return setError('Tu número de WhatsApp es requerido para confirmación')
    setSaving(true); setError(null)
    try {
      const payload = {
        session_id:        sessionId,
        direccion_entrega: form.direccion.trim(),
        observaciones:     form.observaciones.trim() || undefined,
        // Si el cliente está logueado, usar su cliente_id; si no, pasar datos manuales
        ...(cliente_id
          ? { cliente_id }
          : { nombre: user?.nombre || undefined, telefono: form.telefono.trim(), email: user?.email || undefined }
        ),
      }
      const { data } = await checkoutCarrito(payload)
      const nuevoPedido = data?.data || data
      setPedido(nuevoPedido)
      setStep('exito')
      await syncCart()
      onPedidoCreado?.()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al crear el pedido')
    } finally { setSaving(false) }
  }

  if (step === 'exito') {
    return (
      <div style={{ maxWidth: '480px', margin: '3rem auto', textAlign: 'center', background: '#fff', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>¡Pedido creado!</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Tu pedido <strong>#{pedido?.id}</strong> fue registrado. Recibirás un mensaje de WhatsApp para confirmar.
          Tienes 5 minutos para responder <strong>SI</strong> o <strong>NO</strong>.
        </p>
        <p style={{ fontSize: '0.85rem', color: ACCENT, marginBottom: '1.5rem' }}>
          💰 Total: <strong>${parseFloat(pedido?.total || 0).toFixed(2)}</strong> · Pago en efectivo al delivery
        </p>
        <button onClick={() => setStep('carrito')}
          style={{ padding: '0.75rem 2rem', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
          Seguir comprando
        </button>
      </div>
    )
  }

  if (step === 'checkout') {
    return (
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <button onClick={() => setStep('carrito')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontWeight: 600, marginBottom: '1rem', padding: 0 }}>
          ← Volver al carrito
        </button>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>Datos de entrega</h3>
          {error && <p style={{ color: '#c62828', background: '#ffebee', padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.3rem' }}>Dirección de entrega *</label>
              <input value={form.direccion} onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                placeholder="Col. Escalón, 5a calle pte #123..."
                style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #dde', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {!cliente_id && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.3rem' }}>WhatsApp (con código de país) *</label>
                <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                  placeholder="50372880187"
                  style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #dde', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Recibirás confirmación de tu pedido por WhatsApp</p>
              </div>
            )}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.3rem' }}>Observaciones</label>
              <textarea value={form.observaciones} onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
                placeholder="Dejar en portería, tocar timbre..."
                rows={2}
                style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #dde', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* Resumen */}
            <div style={{ background: '#f8f9fb', borderRadius: '8px', padding: '1rem', fontSize: '0.875rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Resumen del pedido</p>
              {items.map(i => (
                <div key={i.producto_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#555' }}>
                  <span>{i.producto?.nombre} × {i.cantidad}</span>
                  <span>${i.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #dde', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: ACCENT }}>${(cart.subtotal || 0).toFixed(2)}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.4rem' }}>💵 Pago en efectivo al delivery</p>
            </div>

            <button type="submit" disabled={saving}
              style={{ padding: '0.875rem', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
              {saving ? 'Creando pedido...' : 'Confirmar pedido'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#555' }}>Tu carrito está vacío</h3>
        <p style={{ color: '#888', marginTop: '0.5rem' }}>Agrega productos desde la tienda</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {items.map((item, i) => (
          <div key={item.producto_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            {item.producto?.imagen
              ? <img src={item.producto.imagen} alt={item.producto.nombre} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              : <div style={{ width: '56px', height: '56px', background: '#f4f6fb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem' }}>📦</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.producto?.nombre}</p>
              <p style={{ fontSize: '0.8rem', color: ACCENT, fontWeight: 700, margin: '0.1rem 0 0' }}>${item.precio_unitario.toFixed(2)} c/u</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => changeQty(item.producto_id, item.cantidad - 1)}
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1.5px solid #dde', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>−</button>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</span>
              <button onClick={() => changeQty(item.producto_id, item.cantidad + 1)}
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1.5px solid #dde', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>+</button>
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '60px', textAlign: 'right' }}>${item.subtotal.toFixed(2)}</p>
            <button onClick={() => removeFromCart(item.producto_id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', fontSize: '1rem', padding: '0.25rem' }}>✕</button>
          </div>
        ))}
      </div>

      {/* Total y acciones */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#666' }}>{cart.total_items} producto{cart.total_items !== 1 ? 's' : ''}</span>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: ACCENT }}>Total: ${(cart.subtotal || 0).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={clearCart}
            style={{ flex: 1, padding: '0.7rem', border: '1.5px solid #dde', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#555', fontSize: '0.875rem' }}>
            Vaciar carrito
          </button>
          <button onClick={() => setStep('checkout')}
            style={{ flex: 2, padding: '0.7rem', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
            Proceder al pago →
          </button>
        </div>
      </div>
    </div>
  )
}
