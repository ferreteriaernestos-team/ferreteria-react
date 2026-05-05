import { useState } from 'react'
import Hero from '../components/ui/Hero'
import ProductCard from '../components/ui/ProductCard'
import Breadcrumb from '../components/ui/Breadcrumb'
import Benefits from '../components/ui/Benefits'
import ProductFilters from '../components/ui/ProductFilters'
import { PRODUCTS, CATEGORIES } from '../data/products'

function HomePage() {
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS)

  function handleFilter({ selectedCats, selectedBrands, maxPrice, onlyStock }) {
    const result = PRODUCTS.filter(p => {
      const catOk = selectedCats.length === 0 || selectedCats.includes(p.categoria)
      const brandOk = selectedBrands.length === 0 || selectedBrands.includes(p.brand)
      const priceOk = p.price <= maxPrice
      const stockOk = !onlyStock || p.inStock
      return catOk && brandOk && priceOk && stockOk
    })
    setFilteredProducts(result)
  }

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

      {/* Productos con filtros */}
      <section className="section section--gray">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Productos destacados</h2>
            <p className="section__subtitle">Las mejores ofertas en herramientas y materiales</p>
          </div>
          <div className="products-layout">
            <ProductFilters onFilter={handleFilter} />
            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <p style={{color:'var(--subtle)', gridColumn:'1/-1', padding:'2rem'}}>
                  No se encontraron productos con esos filtros.
                </p>
              ) : (
                filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <Benefits />
    </main>
  )
}

export default HomePage