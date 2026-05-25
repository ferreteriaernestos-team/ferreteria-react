import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ui/ProductCard'
import Breadcrumb from '../components/ui/Breadcrumb'
import { getProductos, getCategorias } from '../services/api'
import { toArr } from '../utils/parseResponse'

const LIMIT = 24

const CAT_COLORS = [
  '#FF6B35', '#1a1a2e', '#2563eb', '#16a34a',
  '#9333ea', '#0891b2', '#dc2626', '#d97706',
]
function getCatColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return CAT_COLORS[Math.abs(hash) % CAT_COLORS.length]
}

function ProductSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ height: '180px', background: '#f3f4f6' }} />
      <div style={{ padding: '1rem' }}>
        <div style={{ height: '12px', width: '45%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.4rem' }} />
        <div style={{ height: '14px', width: '80%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.75rem' }} />
        <div style={{ height: '18px', width: '40%', background: '#f3f4f6', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

function CategoriaPage() {
  // Puede venir como ID numérico o como nombre de texto (legacy)
  const { nombre: param } = useParams()
  const navigate = useNavigate()

  const [categoria, setCategoria] = useState(null)
  const [products, setProducts]   = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  // Resolución de categoría: si `param` es numérico usar como ID,
  // si es texto, buscar por nombre en la lista de categorías
  useEffect(() => {
    if (!isNaN(param) && param !== '') {
      // Es un ID — buscar la categoría para mostrar su nombre
      getCategorias()
        .then(r => {
          const cats = toArr(r.data?.data || r.data)
          const found = cats.find(c => String(c.id) === String(param))
          setCategoria(found || { id: param, nombre: `Categoría #${param}` })
        })
        .catch(() => setCategoria({ id: param, nombre: `Categoría #${param}` }))
    } else {
      // Es un nombre (navegación legacy desde homepage)
      getCategorias()
        .then(r => {
          const cats = toArr(r.data?.data || r.data)
          const found = cats.find(c => c.nombre.toLowerCase() === decodeURIComponent(param).toLowerCase())
          setCategoria(found || { nombre: decodeURIComponent(param) })
        })
        .catch(() => setCategoria({ nombre: decodeURIComponent(param) }))
    }
  }, [param])

  // Cargar productos cuando tengamos la categoría o cambie la página
  const cargar = useCallback(() => {
    if (!categoria) return
    setLoading(true); setError(null)
    const params = { limit: LIMIT, page }
    if (categoria.id) params.categoria_id = categoria.id
    else params.buscar = categoria.nombre
    if (search) params.buscar = search
    getProductos(params)
      .then(r => {
        const raw  = r.data
        const list = toArr(raw?.data || raw)
        const tot  = raw?.pagination?.total ?? raw?.total ?? list.length
        setProducts(list)
        setTotal(tot)
      })
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false))
  }, [categoria, page, search])

  useEffect(() => { cargar() }, [cargar])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const color = getCatColor(categoria?.nombre || '')

  return (
    <main>
      <Breadcrumb items={[{ label: 'Inicio', path: '/' }]} current={categoria?.nombre || '…'} />

      <section className="section">
        <div className="container">

          {/* Header de categoría */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            borderRadius: '16px', padding: '1.75rem 2rem', marginBottom: '2.5rem',
            background: `linear-gradient(135deg, ${color}11, ${color}08)`,
            border: `1.5px solid ${color}22`,
            flexWrap: 'wrap',
          }}>
            {categoria?.imagen ? (
              <img src={categoria.imagen} alt={categoria.nombre} style={{ width: '72px', height: '72px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: '72px', height: '72px', borderRadius: '14px', flexShrink: 0,
                background: `linear-gradient(135deg, ${color}33, ${color}55)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 700, color: 'var(--fg)', margin: 0, lineHeight: 1.1,
              }}>
                {categoria?.nombre || '…'}
              </h1>
              <p style={{ color: 'var(--subtle)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                {loading ? '…' : `${total} producto${total !== 1 ? 's' : ''} disponible${total !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', border: `1.5px solid ${color}44`, borderRadius: '8px', background: 'transparent', color, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}11` }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Inicio
            </button>
          </div>

          {/* Búsqueda inline */}
          <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.75rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" placeholder="Buscar en esta categoría..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color 0.15s' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>⚠ {error}</span>
              <button onClick={cargar} style={{ padding: '0.35rem 0.75rem', border: '1px solid #dc2626', borderRadius: '6px', color: '#dc2626', background: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                Reintentar
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="products-grid">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : products.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
                    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  </svg>
                </div>
                <p style={{ fontWeight: 700, color: '#374151', fontSize: '1rem', marginBottom: '0.4rem' }}>
                  {search ? 'Sin resultados' : 'Sin productos en esta categoría'}
                </p>
                <p style={{ color: 'var(--subtle)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  {search ? 'Intenta con otro término de búsqueda' : 'Aún no hay productos aquí. ¡Vuelve pronto!'}
                </p>
                <button onClick={() => navigate('/')} style={{ padding: '0.65rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Ver todos los productos
                </button>
              </div>
            ) : (
              products.map(product => <ProductCard key={product.id} product={product} />)
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && !loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1.5px solid var(--border)', background: page === 1 ? '#f9fafb' : '#fff', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                ← Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2
                if (p < 1 || p > totalPages) return null
                return (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid', borderColor: p === page ? 'var(--accent)' : 'var(--border)', background: p === page ? 'var(--accent)' : '#fff', color: p === page ? '#fff' : '#374151', cursor: 'pointer', fontWeight: 600 }}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1.5px solid var(--border)', background: page === totalPages ? '#f9fafb' : '#fff', color: page === totalPages ? '#d1d5db' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default CategoriaPage
