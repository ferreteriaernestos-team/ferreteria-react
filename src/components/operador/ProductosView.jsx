import { useState, useEffect } from 'react'
import { getProductos } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import Pagination from '../admin/shared/Pagination'

const limit = 12

function ProductosView() {
  const [products, setProducts] = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = { page, limit }
    if (search) params.buscar = search
    getProductos(params)
      .then(r => { setProducts(toArr(r.data)); setTotal(toTotal(r.data)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text" placeholder="Buscar producto..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ padding: '0.65rem 1rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', width: '300px', outline: 'none' }}
        />
      </div>

      {loading
        ? <p style={{ color: 'var(--subtle)' }}>Cargando...</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {products.length === 0
              ? <p style={{ color: 'var(--subtle)' }}>Sin resultados</p>
              : products.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {p.imagen && (
                    <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />
                  )}
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{p.nombre}</p>
                  {p.codigo && <p style={{ fontSize: '0.75rem', color: 'var(--subtle)', marginBottom: '0.5rem' }}>SKU: {p.codigo}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${parseFloat(p.precio_venta || 0).toFixed(2)}</span>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                      background: p.stock > (p.stock_minimo || 0) ? '#e8f5e9' : '#ffebee',
                      color: p.stock > (p.stock_minimo || 0) ? '#2E7D32' : '#c62828',
                    }}>
                      {p.stock} uds
                    </span>
                  </div>
                  {p.categorias?.nombre && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--subtle)', marginTop: '0.35rem' }}>{p.categorias.nombre}</p>
                  )}
                </div>
              ))
            }
          </div>
        )
      }

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

export default ProductosView
