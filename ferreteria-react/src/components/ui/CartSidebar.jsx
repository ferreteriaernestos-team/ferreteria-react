import { useCart } from '../../context/CartContext'

function CartSidebar() {
  const { cart, cartOpen, setCartOpen, removeFromCart, changeQty, cartSubtotal } = useCart()

  const tax = cartSubtotal * 0.13
  const shipping = cartSubtotal >= 100 ? 0 : 15
  const total = cartSubtotal + tax + shipping

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
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.img} alt={item.name} />
                <div className="cart-item__info">
                  <p className="cart-item__brand">{item.brand}</p>
                  <p className="cart-item__name">{item.name}</p>
                  <div className="cart-item__row">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => changeQty(item.id, -1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => changeQty(item.id, 1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>
                    <span className="cart-item__price">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                </div>
                <button className="cart-item__remove" onClick={() => removeFromCart(item.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-totals">
              <div className="cart-totals__row"><span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span></div>
              <div className="cart-totals__row"><span>Impuesto (13%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="cart-totals__row"><span>Envío</span><span>{shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="cart-totals__total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <button className="btn-checkout">Finalizar compra</button>
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