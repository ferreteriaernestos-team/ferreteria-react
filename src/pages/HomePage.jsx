import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Hero from '../components/ui/Hero'
import ProductCard from '../components/ui/ProductCard'
import ProductCarousel from '../components/ui/ProductCarousel'
import Breadcrumb from '../components/ui/Breadcrumb'
import Benefits from '../components/ui/Benefits'
import { getProductos, getCategorias } from '../services/api'
import { toArr } from '../utils/parseResponse'
import { MOCK_PRODUCTS, FEATURED_MOCK } from '../data/mockProducts'

// Categorías mock para cuando la API esté vacía
const MOCK_CATEGORIAS = [
  { id: 'mc1', nombre: 'Herramientas Eléctricas', imagen: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=80' },
  { id: 'mc2', nombre: 'Herramientas Manuales',   imagen: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=80' },
  { id: 'mc3', nombre: 'Pinturas',                imagen: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80' },
  { id: 'mc4', nombre: 'Construcción',            imagen: 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=400&q=80' },
  { id: 'mc5', nombre: 'Eléctrico',               imagen: 'https://images.unsplash.com/photo-1558618047-f4e4b3fd5b21?w=400&q=80' },
  { id: 'mc6', nombre: 'Seguridad',               imagen: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80' },
  { id: 'mc7', nombre: 'Plomería',                imagen: 'https://images.unsplash.com/photo-1584792686745-55b6de1d4c40?w=400&q=80' },
  { id: 'mc8', nombre: 'Medición',                imagen: 'https://images.unsplash.com/photo-1601055903647-ddf1ee9701b7?w=400&q=80' },
]

function HomePage() {
  const [products, setProducts]     = useState([])
  const [featured, setFeatured]     = useState([])
  const [categorias, setCategorias] = useState([])
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getCategorias()
      .then(r => {
        const cats = toArr(r.data)
        setCategorias(cats.length > 0 ? cats : MOCK_CATEGORIAS)
      })
      .catch(() => setCategorias(MOCK_CATEGORIAS))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { limit: 48 }
    if (search)    params.buscar = search
    if (catFilter) params.categoria_id = catFilter
    getProductos(params)
      .then(r => {
        const list = toArr(r.data)
        if (list.length > 0) {
          setProducts(list)
          // Tomar los primeros 8 como destacados del carrusel
          setFeatured(list.slice(0, 8))
        } else {
          setProducts(MOCK_PRODUCTS)
          setFeatured(FEATURED_MOCK)
        }
      })
      .catch(() => {
        setProducts(MOCK_PRODUCTS)
        setFeatured(FEATURED_MOCK)
      })
      .finally(() => setLoading(false))
  }, [search, catFilter])

  // Productos filtrados para el grid (excluir featured cuando no hay búsqueda activa)
  const gridProducts = (search || catFilter) ? products : products

  return (
    <main>
      <Breadcrumb current="Inicio" />
      <Hero />

      {/* Carrusel de productos destacados */}
      <ProductCarousel
        products={featured}
        title="Productos destacados"
        subtitle="Las mejores herramientas y materiales para tu proyecto"
      />

      {/* Categorías */}
      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Categorías</h2>
            <p className="section__subtitle">Encuentra todo lo que necesitas organizado por categoría</p>
          </div>
          <div className="categories-grid">
            {categorias.slice(0, 8).map(cat => (
              <div key={cat.id} className="category-card" style={{cursor:'pointer'}}
                onClick={() => navigate(`/categoria/${cat.nombre}`)}>
                {cat.imagen
                  ? <img src={cat.imagen} alt={cat.nombre} loading="lazy" />
                  : <div style={{ width: '100%', height: '100%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🔧</div>
                }
                <div className="category-card__overlay" />
                <div className="category-card__label">
                  <span>{cat.nombre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de todos los productos */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Todos los productos</h2>
            <p className="section__subtitle">Herramientas, materiales y equipos al mejor precio</p>
          </div>

          {/* Búsqueda y filtro */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '320px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="Buscar producto..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              style={{ padding: '0.65rem 1rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: '#fff' }}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {(search || catFilter) && (
              <button onClick={() => { setSearch(''); setCatFilter('') }}
                style={{ padding: '0.65rem 0.875rem', borderRadius: '8px', border: '1.5px solid var(--border)', background: '#fff', fontSize: '0.875rem', color: 'var(--subtle)', cursor: 'pointer' }}>
                ✕ Limpiar
              </button>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--subtle)', marginLeft: 'auto' }}>
              {loading ? '' : `${gridProducts.length} producto${gridProducts.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="products-grid" style={{ gridColumn: '1 / -1' }}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: '#f4f6fb', borderRadius: '12px', aspectRatio: '3/4', animation: 'pulse 1.4s ease-in-out infinite' }} />
              ))
            ) : gridProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--subtle)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <p style={{ fontSize: '1rem', fontWeight: 600 }}>No se encontraron productos</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Intenta con otro término de búsqueda</p>
              </div>
            ) : (
              gridProducts.map(product => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </div>
      </section>

      <Benefits />
    </main>
  )
}

export default HomePage
