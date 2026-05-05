import { useState } from 'react'

const CATEGORIES = ['Construcción', 'Herramientas', 'Eléctrico', 'Fontanería', 'Pintura', 'Medición']
const BRANDS = ['DeWalt', 'Makita', 'Bosch', 'Stanley', 'Black & Decker', 'Irwin']

function ProductFilters({ onFilter }) {
  const [selectedCats, setSelectedCats] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [onlyStock, setOnlyStock] = useState(false)

  function toggleCat(cat) {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function toggleBrand(brand) {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  function applyFilters() {
    onFilter({ selectedCats, selectedBrands, maxPrice, onlyStock })
  }

  function resetFilters() {
    setSelectedCats([])
    setSelectedBrands([])
    setMaxPrice(1000)
    setOnlyStock(false)
    onFilter({ selectedCats: [], selectedBrands: [], maxPrice: 1000, onlyStock: false })
  }

  return (
    <aside className="products-sidebar">
      <div className="filters-box">
        <h3>Filtros</h3>

        <div className="filter-group">
          <h4>Categorías</h4>
          {CATEGORIES.map(cat => (
            <label key={cat} className="filter-check">
              <input
                type="checkbox"
                checked={selectedCats.includes(cat)}
                onChange={() => toggleCat(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>

        <div className="filter-group">
          <h4>Marca</h4>
          {BRANDS.map(brand => (
            <label key={brand} className="filter-check">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>

        <div className="filter-group">
          <h4>Precio máximo</h4>
          <input
            type="range"
            className="price-range"
            min="0"
            max="1000"
            value={maxPrice}
            onChange={e => setMaxPrice(parseInt(e.target.value))}
          />
          <div className="price-range-values">
            <span>$0</span>
            <span>${maxPrice}</span>
          </div>
        </div>

        <div className="filter-group">
          <h4>Disponibilidad</h4>
          <label className="filter-check">
            <input
              type="checkbox"
              checked={onlyStock}
              onChange={e => setOnlyStock(e.target.checked)}
            />
            <span>Solo en stock</span>
          </label>
        </div>

        <button className="btn-apply-filters" onClick={applyFilters}>
          Aplicar filtros
        </button>
        <button
          onClick={resetFilters}
          style={{width:'100%', marginTop:'0.5rem', padding:'0.6rem', fontSize:'0.875rem', color:'var(--subtle)', cursor:'pointer'}}
        >
          Limpiar filtros
        </button>
      </div>
    </aside>
  )
}

export default ProductFilters