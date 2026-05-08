import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

function AuthModal() {
  const { authOpen, setAuthOpen, showToast } = useCart()
  const { login, register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ nombre: '', apellido: '', email: '', password: '' })
  const [terms, setTerms] = useState(false)

  if (!authOpen) return null

  async function handleLogin(e) {
    e.preventDefault()
    const result = await login(loginForm.email, loginForm.password)
    if (result.ok) {
      setAuthOpen(false)
      if (result.rol === 'admin') {
        navigate('/admin')
      } else {
        showToast('Sesión iniciada correctamente')
      }
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!terms) return showToast('Debes aceptar los términos y condiciones')
    const result = await register(
      registerForm.nombre,
      registerForm.apellido,
      registerForm.email,
      registerForm.password
    )
    if (result.ok) {
      showToast('Cuenta creada correctamente')
      setAuthOpen(false)
    }
  }

  return (
    <>
      <div className="auth-overlay open" onClick={() => setAuthOpen(false)} />
      <div className="auth-modal open">
        <button className="auth-modal__close" onClick={() => setAuthOpen(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div className="auth-modal__logo">Ferretería <span>Ernesto's</span></div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
            Iniciar sesión
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            Crear cuenta
          </button>
        </div>

        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            {error}
          </div>
        )}

        {/* LOGIN */}
        {tab === 'login' && (
          <form className="auth-form active" onSubmit={handleLogin}>
            <div className="auth-form__group">
              <label className="auth-form__label">Correo electrónico</label>
              <div className="auth-form__input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input
                  type="email" placeholder="tu@correo.com" className="auth-form__input"
                  value={loginForm.email}
                  onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">Contraseña</label>
              <div className="auth-form__input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="auth-form__input"
                  value={loginForm.password}
                  onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button className="auth-form__eye" onClick={() => setShowPassword(!showPassword)} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="auth-form__forgot"><a href="#">¿Olvidaste tu contraseña?</a></div>
            <button className="auth-form__submit" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        )}

        {/* REGISTRO */}
        {tab === 'register' && (
          <form className="auth-form active" onSubmit={handleRegister}>
            <div className="auth-form__row">
              <div className="auth-form__group">
                <label className="auth-form__label">Nombre</label>
                <div className="auth-form__input-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <input
                    type="text" placeholder="Tu nombre" className="auth-form__input"
                    value={registerForm.nombre}
                    onChange={e => setRegisterForm(p => ({ ...p, nombre: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="auth-form__group">
                <label className="auth-form__label">Apellido</label>
                <div className="auth-form__input-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <input
                    type="text" placeholder="Tu apellido" className="auth-form__input"
                    value={registerForm.apellido}
                    onChange={e => setRegisterForm(p => ({ ...p, apellido: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">Correo electrónico</label>
              <div className="auth-form__input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input
                  type="email" placeholder="tu@correo.com" className="auth-form__input"
                  value={registerForm.email}
                  onChange={e => setRegisterForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">Contraseña</label>
              <div className="auth-form__input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" className="auth-form__input"
                  value={registerForm.password}
                  onChange={e => setRegisterForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button className="auth-form__eye" onClick={() => setShowPassword(!showPassword)} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>
            <label className="auth-form__check">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
              <span>Acepto los <a href="#">términos y condiciones</a></span>
            </label>
            <button className="auth-form__submit" type="submit" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}

export default AuthModal
