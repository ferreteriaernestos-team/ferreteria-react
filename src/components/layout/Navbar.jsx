import { useState } from 'react'
import { Link } from 'react-router-dom'

const DEPARTMENTS = [
  { name: 'Construcción', icon: '🔨', items: ['Cemento y Concreto', 'Ladrillos y Blocks', 'Arena y Grava', 'Varillas y Acero'] },
  { name: 'Herramientas', icon: '🔧', items: ['Herramientas Eléctricas', 'Herramientas Manuales', 'Taladros', 'Sierras y Cortadoras'] },
  { name: 'Eléctrico',    icon: '⚡', items: ['Cables y Alambres', 'Interruptores', 'Tomacorrientes', 'Iluminación'] },
  { name: 'Fontanería',   icon: '💧', items: ['Tuberías PVC', 'Llaves y Grifos', 'Accesorios de Baño', 'Bombas de Agua'] },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar" style={{position:'relative'}}>
      <div className="container">
        <button
          className="navbar__depts"
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
          onClick={() => setMenuOpen(!menuOpen)}
        >
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
          <Link to="/promociones">Promociones</Link>
          <Link to="/marcas">Marcas</Link>
          <Link to="/ideas">Ideas y soluciones</Link>
        </div>
      </div>

      <div
        className={`mega-menu ${menuOpen ? 'open' : ''}`}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <div className="container">
          <div className="mega-menu__inner">
            {DEPARTMENTS.map((dept, i) => (
              <div key={i} className="mega-menu__col">
                <h3>{dept.icon} {dept.name}</h3>
                <ul>
                  {dept.items.map((item, j) => (
                    <li key={j}><button type="button" onClick={() => {}}>{item}</button></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar