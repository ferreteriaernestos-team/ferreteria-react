import { useCart } from '../../context/CartContext'

function WishlistSidebar() {
  const { wishlist, wishlistOpen, setWishlistOpen, toggleWishlist, addToCart, setCartOpen } = useCart()

  return (
    <>
      <div className={`cart-overlay ${wishlistOpen ? 'open' : ''}`} onClick={() => setWishlistOpen(false)} />
      <div className={`cart-sidebar ${wishlistOpen ? 'open' : ''}`}>
        <div className="cart-sidebar__header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            Lista de deseos
          </h2>
          <button className="cart-close" onClick={() => setWishlistOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="cart-items">
          {wishlist.length === 0 ? (
            <div className="cart-empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <p>Tu lista de deseos está vacía</p>
            </div>
          ) : (
            wishlist.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.img} alt={item.name} />
                <div className="cart-item__info">
                  <p className="cart-item__brand">{item.brand}</p>
                  <p className="cart-item__name">{item.name}</p>
                  <div className="cart-item__row" style={{marginTop:'0.5rem'}}>
                    <span className="cart-item__price">${item.price.toFixed(2)}</span>
                    <button
                      className="btn-cart"
                      style={{padding:'0.4rem 0.75rem', fontSize:'0.75rem'}}
                      onClick={() => { addToCart(item); setWishlistOpen(false); setCartOpen(true) }}
                    >
                      Al carrito
                    </button>
                  </div>
                </div>
                <button className="cart-item__remove" onClick={() => toggleWishlist(item)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {wishlist.length > 0 && (
          <div className="cart-sidebar__footer">
            <button className="btn-checkout" onClick={() => {
              wishlist.forEach(p => addToCart(p))
              setWishlistOpen(false)
              setCartOpen(true)
            }}>
              Agregar todo al carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default WishlistSidebar