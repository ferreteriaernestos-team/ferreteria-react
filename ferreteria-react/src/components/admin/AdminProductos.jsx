import { useState } from 'react'
import { PRODUCTS } from '../../data/products'

function AdminProductos() {
  const [products, setProducts] = useState(PRODUCTS)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({ name: '', brand: '', price: '', categoria: '', inStock: true })

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(product) {
    setEditProduct(product)
    setForm({ name: product.name, brand: product.brand, price: product.price, categoria: product.categoria, inStock: product.inStock })
    setShowForm(true)
  }

  function handleDelete(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setProducts(prev => prev.filter(p => p.id !== id))
    }
  }

  function handleSubmit() {
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...form, price: parseFloat(form.price) } : p))
    }
    setShowForm(false)
    setEditProduct(null)
    setForm({ name: '', brand: '', price: '', categoria: '', inStock: true })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.65rem 1rem', border: '1.5px solid var(--border)',
            borderRadius: '8px', fontSize: '0.875rem', width: '300px', outline: 'none'
          }}
        />
        <button
          onClick={() => { setShowForm(true); setEditProduct(null); setForm({ name: '', brand: '', price: '', categoria: '', inStock: true }) }}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600,
            cursor: 'pointer', fontSize: '0.875rem'
          }}
        >
          + Agregar producto
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--secondary)' }}>
              {['Producto', 'Marca', 'Categoría', 'Precio', 'Stock', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={p.img} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{p.brand}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--subtle)' }}>{p.categoria}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700 }}>${p.price.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    background: p.inStock ? '#e8f5e9' : '#ffebee',
                    color: p.inStock ? '#2E7D32' : '#c62828'
                  }}>
                    {p.inStock ? 'En stock' : 'Agotado'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(p)} style={{
                      padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem',
                      fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--accent)',
                      color: 'var(--accent)', background: 'transparent'
                    }}>Editar</button>
                    <button onClick={() => handleDelete(p.id)} style={{
                      padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem',
                      fontWeight: 600, cursor: 'pointer', border: '1.5px solid #c62828',
                      color: '#c62828', background: 'transparent'
                    }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal formulario */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 700
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', zIndex: 800,
            transform: 'translate(-50%,-50%)', background: '#fff',
            borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>
              {editProduct ? 'Editar producto' : 'Agregar producto'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Nombre', key: 'name', type: 'text' },
                { label: 'Marca', key: 'brand', type: 'text' },
                { label: 'Precio', key: 'price', type: 'number' },
                { label: 'Categoría', key: 'categoria', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-fg)', display: 'block', marginBottom: '0.35rem' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '0.65rem 0.875rem',
                      border: '1.5px solid var(--border)', borderRadius: '8px',
                      fontSize: '0.875rem', outline: 'none'
                    }}
                  />
                </div>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={e => setForm(prev => ({ ...prev, inStock: e.target.checked }))}
                  style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                />
                En stock
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={handleSubmit} style={{
                flex: 1, background: 'var(--accent)', color: '#fff', border: 'none',
                padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer'
              }}>
                {editProduct ? 'Guardar cambios' : 'Agregar'}
              </button>
              <button onClick={() => setShowForm(false)} style={{
                flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none',
                padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminProductos