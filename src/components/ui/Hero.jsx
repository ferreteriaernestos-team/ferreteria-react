import { useState, useEffect } from 'react'

const slides = [
  {
    bg: '#FF6B35',
    title: '¡Ofertas increíbles en herramientas!',
    subtitle: 'Hasta 40% de descuento en herramientas eléctricas',
    cta: 'Ver ofertas',
    img: 'https://images.unsplash.com/photo-1546827209-a218e99fdbe9?w=900&q=80'
  },
  {
    bg: '#2E7D32',
    title: 'Nuevas herramientas profesionales',
    subtitle: 'Las mejores marcas para tu proyecto',
    cta: 'Explorar',
    img: 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=900&q=80'
  },
  {
    bg: '#1565C0',
    title: 'Todo para tu construcción',
    subtitle: 'Materiales de calidad al mejor precio',
    cta: 'Comprar ahora',
    img: 'https://images.unsplash.com/photo-1590736969596-f27b3f29c7d2?w=900&q=80'
  },
]

function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length)
  const next = () => setCurrent(prev => (prev + 1) % slides.length)

  return (
    <section className="hero">
      {slides.map((slide, i) => (
        <div key={i} className={`hero__slide ${i === current ? 'active' : ''}`} style={{ background: slide.bg }}>
          <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', alignItems: 'center' }}>
            <div className="hero__content">
              <h2>{slide.title}</h2>
              <p>{slide.subtitle}</p>
              <a href="#" className="hero__cta">{slide.cta}</a>
            </div>
          </div>
          <img className="hero__img" src={slide.img} alt={slide.title} />
          <div className="hero__img-overlay" style={{ color: slide.bg }}></div>
        </div>
      ))}

      <button className="hero__nav-btn hero__nav-btn--prev" onClick={prev}>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button className="hero__nav-btn hero__nav-btn--next" onClick={next}>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div className="hero__dots">
        {slides.map((_, i) => (
          <button key={i} className={`hero__dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </section>
  )
}

export default Hero