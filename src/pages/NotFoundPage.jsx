import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{fontSize: '6rem', marginBottom: '1rem'}}>🔧</div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem, 10vw, 8rem)',
        fontWeight: 700, color: 'var(--accent)', lineHeight: 1
      }}>404</h1>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: '1.75rem',
        fontWeight: 700, margin: '1rem 0 0.5rem'
      }}>Página no encontrada</h2>
      <p style={{color: 'var(--subtle)', marginBottom: '2rem', maxWidth: '400px'}}>
        Lo sentimos, la página que buscas no existe o fue movida.
      </p>
      <Link to="/" style={{
        background: 'var(--accent)', color: '#fff',
        padding: '0.875rem 2rem', borderRadius: 'var(--radius)',
        fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
        transition: '0.2s ease'
      }}>
        Volver al inicio
      </Link>
    </main>
  )
}

export default NotFoundPage