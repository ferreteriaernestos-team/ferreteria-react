import { useState } from 'react'

function PromoBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="promo-banner">
      <div className="container">
        <div className="promo-banner__text">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <span><strong>¡Oferta especial!</strong> Hasta 40% de descuento en herramientas eléctricas. <a href="#">Comprar ahora</a></span>
        </div>
        <button className="promo-banner__close" onClick={() => setVisible(false)} aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default PromoBanner
