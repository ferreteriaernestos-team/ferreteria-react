import { useState } from 'react'
import { useCart } from '../../context/CartContext'

function AuthModal() {
  const { authOpen, setAuthOpen } = useCart()
  const [tab, setTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)

  if (!authOpen) return null

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

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
            Iniciar sesión
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            Crear cuenta
          </button>
        </div>

        {/* LOGIN */}
        {tab === 'login' && (
          <div className="auth-form active">
            <div className="auth-form__group">
              <label className="auth-form__label">Correo electrónico</label>
              <div className="auth-form__input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input type="email" placeholder="tu@correo.com" className="auth-form__input" />
              </div>
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">Contraseña</label>
              <div className="auth-form__input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="auth-form__input" />
                <button className="auth-form__eye" onClick={() => setShowPassword(!showPassword)} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="auth-form__forgot"><a href="#">¿Olvidaste tu contraseña?</a></div>
            <button className="auth-form__submit">Iniciar sesión</button>
            <div className="auth-form__divider"><span>o continúa con</span></div>
            <div className="auth-form__social">
              <button className="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        )}

        {/* REGISTRO */}
        {tab === 'register' && (
          <div className="auth-form active">
            <div className="auth-form__row">
              <div className="auth-form__group">
                <label className="auth-form__label">Nombre</label>
                <div className="auth-form__input-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <input type="text" placeholder="Tu nombre" className="auth-form__input" />
                </div>
              </div>
              <div className="auth-form__group">
                <label className="auth-form__label">Apellido</label>
                <div className="auth-form__input-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <input type="text" placeholder="Tu apellido" className="auth-form__input" />
                </div>
              </div>
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">Correo electrónico</label>
              <div className="auth-form__input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input type="email" placeholder="tu@correo.com" className="auth-form__input" />
              </div>
            </div>
            <div className="auth-form__group">
              <label className="auth-form__label">Contraseña</label>
              <div className="auth-form__input-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" className="auth-form__input" />
                <button className="auth-form__eye" onClick={() => setShowPassword(!showPassword)} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>
            <label className="auth-form__check">
              <input type="checkbox" />
              <span>Acepto los <a href="#">términos y condiciones</a></span>
            </label>
            <button className="auth-form__submit">Crear cuenta</button>
          </div>
        )}
      </div>
    </>
  )
}

export default AuthModal