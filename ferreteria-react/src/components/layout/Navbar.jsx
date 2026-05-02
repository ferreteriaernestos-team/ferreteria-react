function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <button className="navbar__depts">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Departamentos
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div className="navbar__links">
          <a href="#">Promociones</a>
          <a href="#">Marcas</a>
          <a href="#">Ideas y soluciones</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar