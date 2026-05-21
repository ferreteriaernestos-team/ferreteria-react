import { useParams } from 'react-router-dom'
import ProductCard from '../components/ui/ProductCard'
import Breadcrumb from '../components/ui/Breadcrumb'
import { PRODUCTS } from '../data/products'

function CategoriaPage() {
  const { nombre } = useParams()
  const productos = PRODUCTS.filter(p => p.categoria.toLowerCase() === nombre.toLowerCase())

  return (
    <main>
      <Breadcrumb current={nombre} />
      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">{nombre}</h2>
            <p className="section__subtitle">{productos.length} productos disponibles</p>
          </div>
          <div className="products-grid">
            {productos.length === 0 ? (
              <p style={{color:'var(--subtle)', gridColumn:'1/-1', padding:'2rem'}}>
                No hay productos en esta categoría.
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

export default CategoriaPage