import { useState, useEffect } from 'react'
import { getProductos, getCategorias } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import { useCart } from '../../context/CartContext'
import Pagination from '../admin/shared/Pagination'

const limit = 12
const ACCENT = '#e8781a'

export default function ClienteTienda() {
  const { addToCart, cartLoading } = useCart()
  const [products, setProducts]   = useState([])
  const [categorias, setCategorias] = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading]     = useState(true)
  const [adding, setAdding]       = useState(null)

  useEffect(() => {
    getCategorias().then(r => setCategorias(toArr(r.data))).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit }
    if (search)    params.buscar = search
    if (catFilter) params.categoria_id = catFilter
    getProductos(params)
      .then(r => { setProducts(toArr(r.data)); setTotal(toTotal(r.data)) })
      .catch(() => {})
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
      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Buscar producto..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ padding: '0.65rem 1rem', border: '1.5px solid #dde', borderRadius: '8px', fontSize: '0.875rem', width: '260px', outline: 'none' }}
        />
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}
          style={{ padding: '0.65rem 1rem', border: '1.5px solid #dde', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {loading
        ? <p style={{ color: '#888' }}>Cargando productos...</p>
        : products.length === 0
          ? <p style={{ color: '#888' }}>No se encontraron productos</p>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Imagen */}
                  <div style={{ height: '160px', background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '3rem' }}>📦</span>
                    }
                    {p.badge && (
                      <span style={{ position: 'absolute', top: '8px', left: '8px', background: ACCENT, color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {p.badge}
                      </span>
                    )}
                    {p.stock === 0 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Sin stock</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {p.categorias?.nombre && (
                      <span style={{ fontSize: '0.7rem', color: ACCENT, fontWeight: 600, textTransform: 'uppercase' }}>{p.categorias.nombre}</span>
                    )}
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3, margin: 0 }}>{p.nombre}</p>
                    {p.marca && <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>{p.marca}</p>}

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: ACCENT }}>${parseFloat(p.precio_venta || 0).toFixed(2)}</span>
                      {p.precio_anterior && (
                        <span style={{ fontSize: '0.75rem', color: '#aaa', textDecoration: 'line-through' }}>${parseFloat(p.precio_anterior).toFixed(2)}</span>
                      )}
                    </div>

                    <button onClick={() => handleAdd(p)}
                      disabled={p.stock === 0 || adding === p.id || cartLoading}
                      style={{
                        marginTop: '0.5rem', padding: '0.55rem', borderRadius: '8px', border: 'none',
                        background: p.stock === 0 ? '#e0e0e0' : ACCENT,
                        color: p.stock === 0 ? '#999' : '#fff',
                        fontWeight: 600, fontSize: '0.8rem', cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.15s',
                      }}>
                      {adding === p.id ? 'Agregando...' : p.stock === 0 ? 'Sin stock' : '+ Agregar al carrito'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <Pagination page={page} totalPages={totalPages} onPageChange={p => { setPage(p); window.scrollTo(0, 0) }} />
    </div>
  )
}
