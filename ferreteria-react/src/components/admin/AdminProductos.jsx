import { useState, useEffect } from 'react'
import { getProductos, getCategorias, createProducto, updateProducto, deleteProducto } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'

const emptyForm = {
  nombre: '', marca: '', precio_venta: '', precio_compra: '',
  stock: '', stock_minimo: '5', categoria_id: '', descripcion: '', codigo: ''
}

function AdminProductos() {
  const [products, setProducts]     = useState([])
  const [categorias, setCategorias] = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)
  const limit = 10

  useEffect(() => {
    getCategorias().then(r => setCategorias(toArr(r.data))).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit }
    if (search) params.search = search
    getProductos(params)
      .then(r => {
        console.log('[Productos]', r.data)
        setProducts(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(() => setError('Error al cargar productos'))
      .finally(() => setLoading(false))
  }, [page, search])

  function handleEdit(p) {
    setEditProduct(p)
    setForm({
      nombre:       p.nombre       || '',
      marca:        p.marca        || '',
      precio_venta: p.precio_venta || '',
      precio_compra:p.precio_compra|| '',
      stock:        p.stock        ?? '',
      stock_minimo: p.stock_minimo ?? '5',
      categoria_id: p.categoria_id || p.categorias?.id || '',
      descripcion:  p.descripcion  || '',
      codigo:       p.codigo       || '',
    })
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await deleteProducto(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch { alert('No se pudo eliminar') }
  }

  async function handleSubmit() {
    setSaving(true); setError(null)
    try {
      const payload = {
        ...form,
        precio_venta:  parseFloat(form.precio_venta),
        precio_compra: parseFloat(form.precio_compra || form.precio_venta),
        stock:         parseInt(form.stock),
        stock_minimo:  parseInt(form.stock_minimo || 5),
        categoria_id:  form.categoria_id ? parseInt(form.categoria_id) : undefined,
      }
      if (editProduct) {
        const { data } = await updateProducto(editProduct.id, payload)
        setProducts(prev => prev.map(p => p.id === editProduct.id ? (data?.producto || data) : p))
      } else {
        const { data } = await createProducto(payload)
        setProducts(prev => [data?.producto || data, ...prev])
      }
      setShowForm(false); setEditProduct(null); setForm(emptyForm)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <input type="text" placeholder="Buscar producto..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ padding: '0.65rem 1rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', width: '300px', outline: 'none' }}
        />
        <button onClick={() => { setShowForm(true); setEditProduct(null); setForm(emptyForm) }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Agregar producto
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading
          ? <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando...</p>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--secondary)' }}>
                  {['Producto', 'Marca', 'Categoría', 'Stock', 'Precio venta', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0
                  ? <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--subtle)' }}>Sin productos</td></tr>
                  : products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {p.imagen && <img src={p.imagen} alt={p.nombre} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px' }} />}
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.nombre}</p>
                            {p.codigo && <p style={{ fontSize: '0.75rem', color: 'var(--subtle)' }}>{p.codigo}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{p.marca || '–'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{p.categorias?.nombre || '–'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: p.stock > 0 ? '#e8f5e9' : '#ffebee', color: p.stock > 0 ? '#2E7D32' : '#c62828' }}>
                          {p.stock} uds
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700 }}>${parseFloat(p.precio_venta || 0).toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEdit(p)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}>Editar</button>
                          <button onClick={() => handleDelete(p.id)} style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #c62828', color: '#c62828', background: 'transparent' }}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )
        }
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', background: page === 1 ? 'var(--secondary)' : '#fff' }}>Anterior</button>
          <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', background: page === totalPages ? 'var(--secondary)' : '#fff' }}>Siguiente</button>
        </div>
      )}

      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 700 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 800, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '520px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>{editProduct ? 'Editar producto' : 'Agregar producto'}</h3>
            {error && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Nombre *',        key: 'nombre',        type: 'text' },
                { label: 'Código / SKU',    key: 'codigo',        type: 'text' },
                { label: 'Marca',           key: 'marca',         type: 'text' },
                { label: 'Precio venta *',  key: 'precio_venta',  type: 'number' },
                { label: 'Precio compra',   key: 'precio_compra', type: 'number' },
                { label: 'Stock',           key: 'stock',         type: 'number' },
                { label: 'Stock mínimo',    key: 'stock_minimo',  type: 'number' },
                { label: 'Descripción',     key: 'descripcion',   type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              {categorias.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: '0.35rem' }}>Categoría</label>
                  <select value={form.categoria_id} onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
                    <option value="">Sin categoría</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Guardando...' : editProduct ? 'Guardar cambios' : 'Agregar'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminProductos
