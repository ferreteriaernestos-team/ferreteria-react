import ProductCard from '../components/ui/ProductCard'
import Breadcrumb from '../components/ui/Breadcrumb'
import { PRODUCTS } from '../data/products'

const promos = PRODUCTS.filter(p => p.oldPrice !== null)

function PromocionesPage() {
  return (
    <main>
      <Breadcrumb current="Promociones" />
      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">🏷️ Promociones</h2>
            <p className="section__subtitle">Los mejores descuentos en herramientas y materiales</p>
          </div>
          <div className="products-grid">
            {promos.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default PromocionesPage