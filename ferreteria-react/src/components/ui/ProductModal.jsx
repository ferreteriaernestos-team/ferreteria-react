import { useEffect, useRef, useState } from 'react'
import { useCart } from '../../context/CartContext'

function ProductModal({ product, onClose }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart()
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [activeImg, setActiveImg] = useState(0)
  const inWishlist = isInWishlist(product.id)

  const images = product.images || [product.img]

  const closeBtnRef = useRef(null)
  const lastActiveElementRef = useRef(null)

  useEffect(() => {
    lastActiveElementRef.current = document.activeElement
    // Cuando se monta el modal, movemos el foco al botón de cerrar
    closeBtnRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    return () => {
      // restaurar foco al cerrar
      lastActiveElementRef.current?.focus?.()
    }
  }, [])

  return (
    <>
      <div className="modal-overlay open" onClick={onClose}>
        <div
          className="modal"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
        >
          <button className="modal__close" onClick={onClose} type="button" ref={closeBtnRef}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            <span className="sr-only">Cerrar</span>
          </button>
            <div className="modal__grid">
            {/* Galería */}
            
            <div className="modal__gallery">
              <div className="modal__main-img">
                <img src={images[activeImg]} alt={product.name} />
              </div>
              <div className="modal__thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`modal__thumb ${i === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-pressed={i === activeImg}
                  >
                    <img src={img} alt={`Imagen ${i + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="modal__info">
              <p className="modal__brand">{product.brand}</p>
              <h2 className="modal__name">{product.name}</h2>
              {product.oldPrice && <p className="modal__price-old">${product.oldPrice.toFixed(2)}</p>}
              <div className="modal__price-row">
                <span className="modal__price">${product.price.toFixed(2)}</span>
                {product.badge && <span className="modal__price-badge">{product.badge}</span>}
              </div>
              <div className="modal__stock">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {product.inStock ? 'En stock - Envío disponible' : 'Agotado'}
              </div>

              <p className="modal__qty-label">Cantidad</p>
              <div className="modal__qty">
                <button className="modal__qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className="modal__qty-num">{qty}</span>
                <button className="modal__qty-btn" onClick={() => setQty(q => q + 1)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>

              <div className="modal__actions">
                <button className="btn-cart" onClick={() => { for(let i = 0; i < qty; i++) addToCart(product); onClose(); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Agregar al carrito
                </button>
                <button className="btn-buy">Comprar ahora</button>
                <button className="btn-wishlist" onClick={() => toggleWishlist(product)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill={inWishlist ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  {inWishlist ? 'En favoritos ❤️' : 'Agregar a favoritos'}
                </button>
              </div>

              {/* Tabs */}
              <div className="modal__tabs-nav">
                {['description', 'specs', 'reviews'].map(t => (
                  <button key={t} className={`modal__tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                    {t === 'description' ? 'Descripción' : t === 'specs' ? 'Especificaciones' : 'Opiniones'}
                  </button>
                ))}
              </div>

              {activeTab === 'description' && (
                <div className="modal__tab-content active">
                  <p>Motor sin escobillas de alta eficiencia. Perfecto para proyectos de construcción y reparación.</p>
                  <ul style={{paddingLeft:'1.2rem', listStyle:'disc', marginTop:'0.75rem'}}>
                    <li>Motor sin escobillas de alta eficiencia</li>
                    <li>Batería de litio de 20V</li>
                    <li>Luz LED integrada</li>
                    <li>Diseño ergonómico y ligero</li>
                  </ul>
                </div>
              )}
              {activeTab === 'specs' && (
                <div className="modal__tab-content active">
                  <table className="specs-table">
                    <tbody>
                      <tr><td>Marca</td><td>{product.brand}</td></tr>
                      <tr><td>Precio</td><td>${product.price.toFixed(2)}</td></tr>
                      <tr><td>Categoría</td><td>{product.categoria}</td></tr>
                      <tr><td>Disponibilidad</td><td>{product.inStock ? 'En stock' : 'Agotado'}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="modal__tab-content active">
                  <div className="review-item">
                    <div className="review-header"><span className="review-author">Juan Pérez</span><span className="review-date">15 Mar 2026</span></div>
                    <p>Excelente producto, muy potente y duradero.</p>
                  </div>
                  <div className="review-item">
                    <div className="review-header"><span className="review-author">María López</span><span className="review-date">10 Mar 2026</span></div>
                    <p>Buena calidad pero un poco pesado.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductModal