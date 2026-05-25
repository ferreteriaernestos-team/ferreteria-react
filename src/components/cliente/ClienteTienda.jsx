import { useState, useEffect } from 'react'
import { getProductos, getCategorias } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import { useCart } from '../../context/CartContext'
import Pagination from '../admin/shared/Pagination'
import * as Icons from '../admin/shared/Icons'

const limit = 12

// ── Componentes compartidos ───────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Input({ icon: Icon, ...props }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {Icon && (
        <span style={{ position: 'absolute', left: '0.75rem', color: '#9ca3af', display: 'flex', pointerEvents: 'none' }}>
          <Icon size={15} />
        </span>
      )}
      <input
        {...props}
        style={{
          padding: `0.6rem ${Icon ? '1rem 0.6rem 2.25rem' : '0.875rem'}`,
          border: '1.5px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '0.875rem',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          width: '100%',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          ...props.style,
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)' }}
        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ height: '160px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ height: '10px', width: '60%', background: '#f0f0f0', borderRadius: '4px' }} />
        <div style={{ height: '14px', width: '85%', background: '#f0f0f0', borderRadius: '4px' }} />
        <div style={{ height: '10px', width: '40%', background: '#f0f0f0', borderRadius: '4px' }} />
        <div style={{ height: '32px', background: '#f0f0f0', borderRadius: '8px', marginTop: '0.5rem' }} />
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ClienteTienda() {
  const { addToCart, cartLoading } = useCart()
  const [products, setProducts]   = useState([])
  const [categorias, setCategorias] = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [adding, setAdding]       = useState(null)

  useEffect(() => {
    getCategorias()
      .then(r => setCategorias(toArr(r.data)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = { page, limit }
    if (search)    params.buscar = search
    if (catFilter) params.categoria_id = catFilter
    getProductos(params)
      .then(r => {
        setProducts(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => setError('No se pudieron cargar los productos. Intenta de nuevo.'))
      .finally(() => setLoading(false))
  }, [page, search, catFilter])

  async function handleAdd(product) {
    setAdding(product.id)
    await addToCart(product)
    setAdding(null)
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      {/* ── Filtros ── */}
      <Card style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 220px' }}>
            <Input
              icon={Icons.Search}
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div style={{ flex: '0 1 200px' }}>
            <select
              value={catFilter}
              onChange={e => { setCatFilter(e.target.value); setPage(1) }}
              style={{
                width: '100%',
                padding: '0.6rem 0.875rem',
                border: '1.5px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                background: '#fff',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
              }}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          {(search || catFilter) && (
            <button
              onClick={() => { setSearch(''); setCatFilter(''); setPage(1) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 0.875rem',
                background: 'transparent', border: '1.5px solid #e5e7eb',
                borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280',
              }}
            >
              <Icons.X size={13} /> Limpiar
            </button>
          )}
          {!loading && (
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
              {total} producto{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </Card>

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: '#fef2f2', color: '#dc2626',
          padding: '0.875rem 1rem', borderRadius: '10px',
          marginBottom: '1.5rem', fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <Icons.AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ── Grid de productos ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
          {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <Card style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Icons.Package size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>No se encontraron productos</p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Prueba con otros filtros o términos de búsqueda</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
          {products.map(p => (
            <ProductCard key={p.id} p={p} adding={adding} cartLoading={cartLoading} onAdd={handleAdd} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={p => { setPage(p); window.scrollTo(0, 0) }} />
    </div>
  )
}

function ProductCard({ p, adding, cartLoading, onAdd }) {
  const sinStock = p.stock === 0

  return (
    <div
      style={{
        background: '#fff', borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: sinStock ? 'default' : 'pointer',
      }}
      onMouseEnter={e => {
        if (!sinStock) {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Imagen */}
      <div style={{
        height: '160px', background: '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative', flexShrink: 0,
      }}>
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Icons.Package size={40} color="#d1d5db" />
        }
        {p.badge && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px',
            background: 'var(--accent)', color: '#fff',
            fontSize: '0.62rem', fontWeight: 700,
            padding: '0.15rem 0.5rem', borderRadius: '4px',
            textTransform: 'uppercase',
          }}>
            {p.badge}
          </span>
        )}
        {sinStock && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {p.categorias?.nombre && (
          <span style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {p.categorias.nombre}
          </span>
        )}
        <p style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.35, margin: 0, color: '#111827' }}>
          {p.nombre}
        </p>
        {p.marca && (
          <p style={{ fontSize: '0.73rem', color: '#9ca3af', margin: 0 }}>{p.marca}</p>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent)' }}>
            ${parseFloat(p.precio_venta || 0).toFixed(2)}
          </span>
          {p.precio_anterior && (
            <span style={{ fontSize: '0.73rem', color: '#d1d5db', textDecoration: 'line-through' }}>
              ${parseFloat(p.precio_anterior).toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={() => !sinStock && onAdd(p)}
          disabled={sinStock || adding === p.id || cartLoading}
          style={{
            marginTop: '0.5rem', padding: '0.55rem 0.75rem',
            borderRadius: '8px', border: 'none',
            background: sinStock ? '#f3f4f6' : 'var(--accent)',
            color: sinStock ? '#9ca3af' : '#fff',
            fontWeight: 600, fontSize: '0.8rem',
            cursor: sinStock ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s, background 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
          }}
          onMouseEnter={e => { if (!sinStock) e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {adding === p.id ? (
            '⏳ Agregando...'
          ) : sinStock ? (
            'Sin stock'
          ) : (
            <><Icons.Plus size={13} /> Agregar al carrito</>
          )}
        </button>
      </div>
    </div>
  )
}
