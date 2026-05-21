import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

function CartSidebar() {
  const { cart, cartOpen, setCartOpen, removeFromCart, changeQty, cartSubtotal, setAuthOpen } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pendingCheckout, setPendingCheckout] = useState(false)

  // After login while pendingCheckout is true → redirect to client cart
  useEffect(() => {
    if (user && pendingCheckout) {
      setPendingCheckout(false)
      setCartOpen(false)
      navigate('/cliente', { state: { section: 'carrito' } })
    }
  }, [user, pendingCheckout, navigate, setCartOpen])

  function handleCheckout() {
    if (!user) {
      setPendingCheckout(true)
      setAuthOpen(true)
      return
    }
    setCartOpen(false)
    navigate('/cliente', { state: { section: 'carrito' } })
  }

  const items    = cart.items || []
  const shipping = cartSubtotal >= 100 ? 0 : 15
  const total    = cartSubtotal + shipping

  return (
    <>
      <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        <div className="cart-sidebar__header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            Carrito de compras
          </h2>
          <button className="cart-close" onClick={() => setCartOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.producto_id} className="cart-item">
                {item.producto?.imagen
                  ? <img src={item.producto.imagen} alt={item.producto.nombre} />
                  : <div style={{ width: '60px', height: '60px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📦</div>
                }
                <div className="cart-item__info">
                  <p className="cart-item__name">{item.producto?.nombre}</p>
                  <div className="cart-item__row">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => changeQty(item.producto_id, item.cantidad - 1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <span className="qty-num">{item.cantidad}</span>
                      <button className="qty-btn" onClick={() => changeQty(item.producto_id, item.cantidad + 1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>
                    <span className="cart-item__price">${item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <button className="cart-item__remove" onClick={() => removeFromCart(item.producto_id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-totals">
              <div className="cart-totals__row"><span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span></div>
              <div className="cart-totals__row"><span>Envío</span><span>{shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="cart-totals__total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <button className="btn-checkout" onClick={handleCheckout}>Finalizar compra</button>
            <p className="cart-free-shipping">
              {shipping > 0 ? `Agrega $${(100 - cartSubtotal).toFixed(2)} más para envío gratis` : '¡Tienes envío gratis! 🎉'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default CartSidebar
