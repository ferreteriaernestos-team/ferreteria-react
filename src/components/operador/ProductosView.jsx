import { useState, useEffect } from 'react'
import { getProductos, getCategorias } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import Pagination from '../admin/shared/Pagination'
import * as Icons from '../admin/shared/Icons'

const limit = 12

/* ── Sub-components ─────────────────────────────────────────── */

function ProductSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ height: '130px', background: '#f3f4f6' }} />
      <div style={{ padding: '1rem' }}>
        <div style={{ height: '14px', width: '70%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.5rem' }} />
        <div style={{ height: '11px', width: '40%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.75rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ height: '18px', width: '55px', background: '#f3f4f6', borderRadius: '4px' }} />
          <div style={{ height: '18px', width: '45px', background: '#f3f4f6', borderRadius: '20px' }} />
        </div>
      </div>
    </div>
  )
}

function StockBadge({ stock, minimo }) {
  const low = stock <= (minimo || 0)
  const out = stock === 0
  if (out) return (
    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: '#fef2f2', color: '#dc2626' }}>
      Sin stock
    </span>
  )
  if (low) return (
    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: '#fff7ed', color: '#ea580c' }}>
      {stock} uds ⚠
    </span>
  )
  return (
    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: '#ecfdf5', color: '#16a34a' }}>
      {stock} uds
    </span>
  )
}

function ProductCard({ p }) {
  const [hover, setHover] = useState(false)
  const low = p.stock <= (p.stock_minimo || 0)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: '12px', overflow: 'hidden',
        boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        border: low && p.stock > 0 ? '1px solid #fed7aa' : '1px solid transparent',
      }}
    >
      {/* Imagen */}
      <div style={{ height: '130px', background: '#f8fafc', overflow: 'hidden', position: 'relative' }}>
        {p.imagen
          ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: hover ? 'scale(1.04)' : 'scale(1)' }} />
          : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Package size={36} color="#d1d5db" />
            </div>
          )
        }
        {p.stock === 0 && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.78rem', background: '#dc2626', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.875rem 1rem' }}>
        {p.categorias?.nombre && (
          <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.2rem' }}>
            {p.categorias.nombre}
          </p>
        )}
        <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#111827', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.nombre}
        </p>
        {p.codigo && (
          <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: '0 0 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Icons.Hash size={10} /> {p.codigo}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>
            ${parseFloat(p.precio_venta || 0).toFixed(2)}
          </span>
          <StockBadge stock={p.stock} minimo={p.stock_minimo} />
        </div>
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────── */

export default function ProductosView() {
  const [products, setProducts]     = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  // Cargar categorías una sola vez
  useEffect(() => {
    getCategorias()
      .then(r => setCategorias(toArr(r.data?.data || r.data)))
      .catch(() => {})
  }, [])

  function cargar() {
    setLoading(true); setError(null)
    const params = { page, limit }
    if (search)      params.buscar      = search
    if (categoriaId) params.categoria_id = categoriaId
    getProductos(params)
      .then(r => { setProducts(toArr(r.data)); setTotal(toTotal(r.data)) })
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [page, search, categoriaId]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const hasFilters = search || categoriaId

  function limpiarFiltros() {
    setSearch(''); setCategoriaId(''); setPage(1)
  }

  return (
    <div>
      {/* ── Filtros ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Icons.Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{
              width: '100%', padding: '0.65rem 0.875rem 0.65rem 2.25rem',
              border: '1.5px solid #e5e7eb', borderRadius: '8px',
              fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'var(--font-body)', transition: 'border-color 0.15s',
              background: '#fff',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
          />
        </div>

        {/* Categorías */}
        <select
          value={categoriaId}
          onChange={e => { setCategoriaId(e.target.value); setPage(1) }}
          style={{
            padding: '0.65rem 2rem 0.65rem 0.875rem',
            border: '1.5px solid #e5e7eb', borderRadius: '8px',
            fontSize: '0.875rem', outline: 'none', background: '#fff',
            color: categoriaId ? '#111827' : '#9ca3af', cursor: 'pointer',
            fontFamily: 'var(--font-body)', transition: 'border-color 0.15s',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        {/* Limpiar filtros */}
        {hasFilters && (
          <button
            onClick={limpiarFiltros}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.65rem 0.875rem', border: '1.5px solid #e5e7eb',
              borderRadius: '8px', background: '#fff', color: '#6b7280',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#dc2626' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}
          >
            <Icons.X size={13} /> Limpiar
          </button>
        )}

        {/* Contador */}
        <span style={{ fontSize: '0.82rem', color: '#9ca3af', marginLeft: 'auto' }}>
          {loading ? '…' : `${total} producto${total !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
          padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#dc2626' }}>
            <Icons.AlertTriangle size={15} /> {error}
          </div>
          <button onClick={cargar} style={{ background: 'none', border: '1px solid #dc2626', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* ── Grid ── */}
      {loading
        ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        )
        : products.length === 0
          ? (
            <div style={{
              background: '#fff', borderRadius: '12px', padding: '4rem 2rem',
              textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <Icons.Package size={48} color="#e5e7eb" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem', fontSize: '1.05rem' }}>
                Sin resultados
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                {hasFilters ? 'Intenta con otros filtros' : 'No hay productos disponibles'}
              </p>
              {hasFilters && (
                <button
                  onClick={limpiarFiltros}
                  style={{
                    marginTop: '1rem', padding: '0.6rem 1.25rem',
                    background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: '8px',
                    fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {products.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          )
      }

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
