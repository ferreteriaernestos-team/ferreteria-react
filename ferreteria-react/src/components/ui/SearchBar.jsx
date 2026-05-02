import { useRef, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { PRODUCTS } from '../../data/products'

function SearchBar() {
  const { searchQuery, searchResults, searchOpen, setSearchOpen, handleSearch } = useCart()
  const wrapperRef = useRef(null)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="header__search" ref={wrapperRef}>
      <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        type="text"
        placeholder="Buscar productos, herramientas, materiales..."
        autoComplete="off"
        value={searchQuery}
        onChange={e => handleSearch(e.target.value, PRODUCTS)}
        onFocus={() => searchQuery && setSearchOpen(true)}
      />

      {/* Dropdown */}
      {searchOpen && (
        <div className="search-dropdown open">
          <div className="search-dropdown__section">
            <div className="search-dropdown__label">Productos sugeridos</div>
            {searchResults.length === 0 ? (
              <p style={{padding:'0.5rem 0.75rem', fontSize:'0.875rem', color:'var(--subtle)'}}>
                No se encontraron resultados
              </p>
            ) : (
              searchResults.slice(0, 6).map(p => (
                <button key={p.id} className="search-dropdown__item" onClick={() => setSearchOpen(false)}>
                  <div className="search-dropdown__row">
                    <span>{p.name}</span>
                    <span className="search-dropdown__cat">{p.categoria}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar