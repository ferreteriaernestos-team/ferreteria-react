import { Link } from 'react-router-dom'

/**
 * Breadcrumb({ current, items })
 * items = [{ label: 'Marcas', path: '/marcas' }, ...]   (optional intermediate crumbs)
 * current = last (non-clickable) label
 */
function Breadcrumb({ current, items = [] }) {
  return (
    <div className="breadcrumb">
      <div className="container">
        <ol>
          <li>
            <Link to="/" className="breadcrumb__home">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Inicio
            </Link>
          </li>
          {items.map((item, i) => (
            <span key={i} style={{ display: 'contents' }}>
              <li className="breadcrumb__sep">›</li>
              <li>
                <Link to={item.path} className="breadcrumb__home" style={{ color: 'var(--subtle)' }}>
                  {item.label}
                </Link>
              </li>
            </span>
          ))}
          <li className="breadcrumb__sep">›</li>
          <li><span className="breadcrumb__current">{current}</span></li>
        </ol>
      </div>
    </div>
  )
}

export default Breadcrumb
