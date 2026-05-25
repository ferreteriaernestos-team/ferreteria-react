import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { checkoutCarrito } from '../../services/api'
import * as Icons from '../admin/shared/Icons'

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', ...style }}>
      {children}
    </div>
  )
}

function FormField({ label, type = 'text', value, onChange, placeholder, required, hint, rows }) {
  const Tag = rows ? 'textarea' : 'input'
  const baseStyle = {
    width: '100%', padding: '0.65rem 0.875rem',
    border: '1.5px solid #e5e7eb', borderRadius: '8px',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'var(--font-body)', transition: 'border-color 0.15s, box-shadow 0.15s',
    ...(rows ? { resize: 'vertical' } : {}),
  }
  return (
    <div>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      <Tag
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={baseStyle}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)' }}
        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
      />
      {hint && <p style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: '0.25rem', marginBottom: 0 }}>{hint}</p>}
    </div>
  )
}

export default function ClienteCarrito({ onPedidoCreado }) {
  const { cart, changeQty, removeFromCart, clearCart, sessionId, cliente_id, syncCart } = useCart()
  const { user } = useAuth()
  const [form, setForm]     = useState({ direccion: '', telefono: '', observaciones: '' })
  const [step, setStep]     = useState('carrito') // 'carrito' | 'checkout' | 'exito'
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const [pedido, setPedido] = useState(null)

  const items = cart.items || []

  async function handleCheckout(e) {
    e.preventDefault()
    if (!form.direccion.trim()) return setError('La dirección de entrega es requerida')
    if (!cliente_id && !form.telefono.trim()) return setError('Tu número de WhatsApp es requerido para la confirmación del pedido')
    setSaving(true); setError(null)
    try {
      const payload = {
        session_id:        sessionId,
        direccion_entrega: form.direccion.trim(),
        observaciones:     form.observaciones.trim() || undefined,
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
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al crear el pedido. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  // ── Éxito ──
  if (step === 'exito') {
    return (
      <Card style={{ maxWidth: '480px', margin: '2rem auto', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: '#f0fdf4', margin: '0 auto 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icons.CheckCircle size={36} color="#16a34a" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>
          ¡Pedido creado!
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
          Tu pedido <strong style={{ color: '#111827' }}>#{pedido?.id}</strong> fue registrado.
          Recibirás un mensaje de WhatsApp para confirmar.
          Tienes <strong>30 minutos</strong> para responder <strong>SI</strong> o <strong>NO</strong>.
        </p>
        <div style={{
          background: '#fff7ed', border: '1px solid #fed7aa',
          borderRadius: '8px', padding: '0.875rem 1rem',
          marginBottom: '1.5rem', fontSize: '0.875rem', color: '#9a3412',
          display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
        }}>
          <Icons.DollarSign size={15} />
          Total: <strong>${parseFloat(pedido?.total || 0).toFixed(2)}</strong> · Pago en efectivo al delivery
        </div>
        <button
          onClick={() => setStep('carrito')}
          style={{
            padding: '0.75rem 2rem', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
            fontSize: '0.9rem', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          Seguir comprando
        </button>
      </Card>
    )
  }

  // ── Checkout ──
  if (step === 'checkout') {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button
          onClick={() => setStep('carrito')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem',
            padding: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem',
          }}
        >
          <Icons.ChevronLeft size={16} /> Volver al carrito
        </button>

        <Card style={{ padding: '1.75rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.MapPin size={18} color="var(--accent)" /> Datos de entrega
          </h3>

          {error && (
            <div style={{
              background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
              padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem',
              fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <Icons.AlertTriangle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField
              label="Dirección de entrega"
              value={form.direccion}
              onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
              placeholder="Col. Escalón, 5a calle pte #123..."
              required
            />

            {!cliente_id && (
              <FormField
                label="WhatsApp (con código de país)"
                type="tel"
                value={form.telefono}
                onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                placeholder="50372880187"
                required
                hint="Recibirás la confirmación de tu pedido por WhatsApp"
              />
            )}

            <FormField
              label="Observaciones"
              value={form.observaciones}
              onChange={e => setForm(p => ({ ...p, observaciones: e.target.value }))}
              placeholder="Dejar en portería, tocar timbre..."
              rows={2}
            />

            {/* Resumen */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', margin: '0 0 0.75rem', color: '#374151' }}>
                Resumen del pedido
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {items.map(i => (
                  <div key={i.producto_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280' }}>
                    <span>{i.producto?.nombre} × {i.cantidad}</span>
                    <span style={{ fontWeight: 600, color: '#374151' }}>${i.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.625rem', marginTop: '0.625rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span style={{ color: '#374151' }}>Total</span>
                <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>${(cart.subtotal || 0).toFixed(2)}</span>
              </div>
              <p style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: '0.4rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icons.DollarSign size={11} /> Pago en efectivo al delivery
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.875rem',
                background: saving ? '#f3f4f6' : 'var(--accent)',
                color: saving ? '#9ca3af' : '#fff',
                border: 'none', borderRadius: '8px',
                fontWeight: 700, fontSize: '0.925rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {saving ? '⏳ Creando pedido...' : <><Icons.CheckCircle size={16} /> Confirmar pedido</>}
            </button>
          </form>
        </Card>
      </div>
    )
  }

  // ── Carrito vacío ──
  if (items.length === 0) {
    return (
      <Card style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: '#f8fafc', margin: '0 auto 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icons.ShoppingCart size={36} color="#d1d5db" />
        </div>
        <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#374151', marginBottom: '0.25rem' }}>
          Tu carrito está vacío
        </p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Agrega productos desde la tienda</p>
      </Card>
    )
  }

  // ── Lista del carrito ──
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <Card>
        {items.map((item, i) => (
          <div
            key={item.producto_id}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.25rem',
              borderBottom: i < items.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}
          >
            {/* Imagen */}
            {item.producto?.imagen
              ? <img
                  src={item.producto.imagen}
                  alt={item.producto.nombre}
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                />
              : <div style={{
                  width: '56px', height: '56px', background: '#f8fafc',
                  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icons.Package size={20} color="#d1d5db" />
                </div>
            }

            {/* Nombre + precio unitario */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.producto?.nombre}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, margin: '0.1rem 0 0' }}>
                ${item.precio_unitario.toFixed(2)} c/u
              </p>
            </div>

            {/* Controles de cantidad */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              <button
                onClick={() => changeQty(item.producto_id, item.cantidad - 1)}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.15s',
                }}
              >−</button>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '22px', textAlign: 'center', color: '#111827' }}>
                {item.cantidad}
              </span>
              <button
                onClick={() => changeQty(item.producto_id, item.cantidad + 1)}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.15s',
                }}
              >+</button>
            </div>

            {/* Subtotal */}
            <p style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '64px', textAlign: 'right', color: '#111827', flexShrink: 0 }}>
              ${item.subtotal.toFixed(2)}
            </p>

            {/* Eliminar */}
            <button
              onClick={() => removeFromCart(item.producto_id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#d1d5db', padding: '0.25rem', borderRadius: '4px',
                display: 'flex', transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#dc2626' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db' }}
            >
              <Icons.Trash2 size={15} />
            </button>
          </div>
        ))}
      </Card>

      {/* Total y acciones */}
      <Card style={{ padding: '1.25rem', marginTop: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {cart.total_items} producto{cart.total_items !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Total:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
              ${(cart.subtotal || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={clearCart}
            style={{
              flex: 1, padding: '0.7rem',
              border: '1.5px solid #e5e7eb', borderRadius: '8px',
              background: '#fff', cursor: 'pointer', fontWeight: 600,
              color: '#6b7280', fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#dc2626' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}
          >
            <Icons.Trash2 size={14} /> Vaciar
          </button>
          <button
            onClick={() => setStep('checkout')}
            style={{
              flex: 3, padding: '0.7rem',
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: '8px',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            <Icons.CheckCircle size={15} /> Proceder al pago →
          </button>
        </div>
      </Card>
    </div>
  )
}
