import { useRef, useState, useEffect } from 'react'
import ProductCard from './ProductCard'

function ProductCarousel({ products = [], title = 'Productos destacados', subtitle = '' }) {
  const trackRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const CARD_WIDTH = 260 // approximate card width + gap
  const SCROLL_AMOUNT = CARD_WIDTH * 2

  function updateArrows() {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect() }
  }, [products])

  function scrollPrev() {
    trackRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })
  }
  function scrollNext() {
    trackRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
  }

  if (!products.length) return null

  return (
    <section className="section">
      <div className="container">
        <div className="section__header">
          <h2 className="section__title">{title}</h2>
          {subtitle && <p className="section__subtitle">{subtitle}</p>}
        </div>

        <div className="pcarousel">
          <button
            className={`pcarousel__btn pcarousel__btn--prev ${!canPrev ? 'pcarousel__btn--hidden' : ''}`}
            onClick={scrollPrev}
            aria-label="Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="pcarousel__track" ref={trackRef}>
            {products.map(product => (
              <div key={product.id} className="pcarousel__item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <button
            className={`pcarousel__btn pcarousel__btn--next ${!canNext ? 'pcarousel__btn--hidden' : ''}`}
            onClick={scrollNext}
            aria-label="Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default ProductCarousel
