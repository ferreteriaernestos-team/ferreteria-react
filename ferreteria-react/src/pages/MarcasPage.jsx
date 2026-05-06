import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../components/ui/Breadcrumb'
import { BRANDS, PRODUCTS } from '../data/products'

function MarcasPage() {
  const navigate = useNavigate()

  function handleBrandClick(brandName) {
    navigate(`/marca/${brandName}`)
  }

  return (
    <main>
      <Breadcrumb current="Marcas" />
      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">🏆 Marcas</h2>
            <p className="section__subtitle">Las mejores marcas del mercado disponibles en nuestra tienda</p>
          </div>
          <div className="brands-grid">
            {BRANDS.map((brand, i) => (
              <div key={i} className="brand-card" onClick={() => handleBrandClick(brand.name)}>
                <div className="brand-card__logo">{brand.logo}</div>
                <h3 className="brand-card__name">{brand.name}</h3>
                <p className="brand-card__desc">{brand.desc}</p>
                <span className="brand-card__count">{brand.products} productos</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default MarcasPage