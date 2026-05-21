import { useParams } from 'react-router-dom'
import ProductCard from '../components/ui/ProductCard'
import Breadcrumb from '../components/ui/Breadcrumb'
import { PRODUCTS, BRANDS } from '../data/products'

function MarcaPage() {
  const { nombre } = useParams()
  const brand = BRANDS.find(b => b.name.toLowerCase() === nombre.toLowerCase())
  const productos = PRODUCTS.filter(p => p.brand.toLowerCase() === nombre.toLowerCase())

  return (
    <main>
      <Breadcrumb current={nombre} />
      <section className="section">
        <div className="container">
          {brand && (
            <div style={{
              display:'flex', alignItems:'center', gap:'1.5rem',
              background:'var(--secondary)', borderRadius:'var(--radius-lg)',
              padding:'2rem', marginBottom:'2rem'
            }}>
              <div style={{fontSize:'4rem'}}>{brand.logo}</div>
              <div>
                <h2 style={{fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:700}}>{brand.name}</h2>
                <p style={{color:'var(--subtle)', marginTop:'0.25rem'}}>{brand.desc}</p>
                <span className="brand-card__count" style={{marginTop:'0.5rem', display:'inline-block'}}>
                  {productos.length} productos disponibles
                </span>
              </div>
            </div>
          )}
          <div className="products-grid">
            {productos.length === 0 ? (
              <p style={{color:'var(--subtle)', gridColumn:'1/-1', padding:'2rem'}}>
                No hay productos de esta marca.
              </p>
            ) : (
              productos.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default MarcaPage