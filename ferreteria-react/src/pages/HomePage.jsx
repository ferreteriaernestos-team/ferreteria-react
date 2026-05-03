import Hero from '../components/ui/Hero'
import ProductCard from '../components/ui/ProductCard'
import Breadcrumb from '../components/ui/Breadcrumb'
import { PRODUCTS, CATEGORIES } from '../data/products'

function HomePage() {
  return (
    <main>
      <Breadcrumb current="Productos" />
      <Hero />

      {/* Categorías */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Categorías destacadas</h2>
            <p className="section__subtitle">Encuentra todo lo que necesitas para tu proyecto</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="category-card">
                <img src={cat.img} alt={cat.name} loading="lazy" />
                <div className="category-card__overlay"></div>
                <div className="category-card__label">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Productos destacados</h2>
            <p className="section__subtitle">Las mejores ofertas en herramientas y materiales</p>
          </div>
          <div className="products-grid">
            {PRODUCTS.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage