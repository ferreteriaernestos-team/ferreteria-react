import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Hero from '../components/ui/Hero'
import ProductCard from '../components/ui/ProductCard'
import ProductCarousel from '../components/ui/ProductCarousel'
import Breadcrumb from '../components/ui/Breadcrumb'
import Benefits from '../components/ui/Benefits'
import { getProductos, getCategorias } from '../services/api'
import { toArr } from '../utils/parseResponse'

/* ── Skeleton ────────────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ height: '180px', background: '#f3f4f6' }} />
      <div style={{ padding: '1rem' }}>
        <div style={{ height: '12px', width: '45%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.4rem' }} />
        <div style={{ height: '14px', width: '80%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.75rem' }} />
        <div style={{ height: '18px', width: '40%', background: '#f3f4f6', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

function CategorySkeleton() {
  return (
    <div style={{ borderRadius: '12px', background: '#f3f4f6', aspectRatio: '1', minHeight: '120px' }} />
  )
}

/* ── Helpers ─────────────────────────────────────────────── */
const ACCENT_SHADES = [
  '#FF6B35', '#1a1a2e', '#2563eb', '#16a34a',
  '#9333ea', '#0891b2', '#dc2626', '#d97706',
]

function getCatColor(idx) { return ACCENT_SHADES[idx % ACCENT_SHADES.length] }

/* ── Component ───────────────────────────────────────────── */
function HomePage() {
  const [products, setProducts]     = useState([])
  const [featured, setFeatured]     = useState([])
  const [categorias, setCategorias] = useState([])
  const [total, setTotal]           = useState(0)
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [loading, setLoading]       = useState(true)
  const [loadingCats, setLoadingCats] = useState(true)
  const [error, setError]           = useState(null)
  const navigate = useNavigate()

  // Cargar categorías
  useEffect(() => {
    setLoadingCats(true)
    getCategorias()
      .then(r => {
        const cats = toArr(r.data?.data || r.data)
        setCategorias(cats)
      })
      .catch(() => setCategorias([]))
      .finally(() => setLoadingCats(false))
  }, [])

  // Cargar productos
  const cargarProductos = useCallback(() => {
    setLoading(true); setError(null)
    const params = { limit: 48 }
    if (search)    params.buscar = search
    if (catFilter) params.categoria_id = catFilter
    getProductos(params)
      .then(r => {
        const raw = r.data
        const list = toArr(raw?.data || raw)
        const tot  = raw?.pagination?.total ?? raw?.total ?? list.length
        setProducts(list)
        setTotal(tot)
        // Top 8 for carousel (only when no filters active)
        if (!search && !catFilter) setFeatured(list.slice(0, 8))
      })
      .catch(() => setError('No se pudieron cargar los productos. Intenta de nuevo.'))
      .finally(() => setLoading(false))
  }, [search, catFilter])

  useEffect(() => { cargarProductos() }, [cargarProductos])

  return (
    <main>
      <Breadcrumb current="Inicio" />
      <Hero />

      {/* Carrusel destacados */}
      {!search && !catFilter && featured.length > 0 && (
        <ProductCarousel
          products={featured}
          title="Productos destacados"
          subtitle="Las mejores herramientas y materiales para tu proyecto"
        />
      )}

      {/* Categorías */}
      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Categorías</h2>
            <p className="section__subtitle">Encuentra todo lo que necesitas organizado por categoría</p>
          </div>

          {loadingCats ? (
            <div className="categories-grid">
              {Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)}
            </div>
          ) : categorias.length === 0 ? (
            <p style={{ color: 'var(--subtle)', textAlign: 'center', padding: '2rem 0' }}>
              Sin categorías disponibles
            </p>
          ) : (
            <div className="categories-grid">
              {categorias.slice(0, 8).map((cat, idx) => (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/categoria/${cat.id}`)}
                  style={{ cursor: 'pointer', position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1', minHeight: '120px' }}
                >
                  {cat.imagen
                    ? <img src={cat.imagen} alt={cat.nombre} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (
                      <div style={{
                        width: '100%', height: '100%',
                        background: `linear-gradient(135deg, ${getCatColor(idx)}, ${getCatColor(idx)}cc)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                          <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                      </div>
                    )
                  }
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '0.875rem',
                  }}>
                    <span style={{
                      color: '#fff', fontFamily: 'var(--font-display)',
                      fontWeight: 700, fontSize: '1rem',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    }}>{cat.nombre}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grid de productos */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Todos los productos</h2>
            <p className="section__subtitle">Herramientas, materiales y equipos al mejor precio</p>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '320px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text" placeholder="Buscar producto..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color 0.15s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              style={{ padding: '0.65rem 1rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: '#fff', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {(search || catFilter) && (
              <button
                onClick={() => { setSearch(''); setCatFilter('') }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.65rem 0.875rem', borderRadius: '8px', border: '1.5px solid var(--border)', background: '#fff', fontSize: '0.82rem', color: 'var(--subtle)', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--subtle)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Limpiar
              </button>
            )}
            {!loading && (
              <span style={{ fontSize: '0.8rem', color: 'var(--subtle)', marginLeft: 'auto' }}>
                {total} producto{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>⚠ {error}</span>
              <button onClick={cargarProductos} style={{ padding: '0.35rem 0.75rem', border: '1px solid #dc2626', borderRadius: '6px', color: '#dc2626', background: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                Reintentar
              </button>
            </div>
          )}

          <div className="products-grid">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : products.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1.25rem', display: 'block' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
                  {search || catFilter ? 'Sin resultados' : 'Sin productos disponibles'}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--subtle)', margin: 0 }}>
                  {search || catFilter ? 'Intenta con otro término o categoría' : 'Vuelve pronto, estamos agregando más productos'}
                </p>
                {(search || catFilter) && (
                  <button onClick={() => { setSearch(''); setCatFilter('') }} style={{ marginTop: '1rem', padding: '0.6rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                    Ver todos los productos
                  </button>
                )}
              </div>
            ) : (
              products.map(product => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </div>
      </section>

      <Benefits />
    </main>
  )
}

export default HomePage
