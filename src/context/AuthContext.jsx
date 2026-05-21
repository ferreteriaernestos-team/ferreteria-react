import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, registerCliente as apiRegisterCliente, getPerfilMe } from '../services/api'

const AuthContext = createContext()

// rol_id → nombre de rol (fallback cuando /auth/me no está disponible)
const ROLE_MAP = { 1: 'admin', 2: 'admin', 3: 'operador', 4: 'operador', 5: 'cliente' }

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function extraerRol(obj) {
  if (!obj) return ''
  const candidatos = [
    obj?.roles?.nombre,
    obj?.rol,
    obj?.role,
    obj?.rolNombre,
    obj?.rol_nombre,
  ]
  const rol = candidatos.find(r => typeof r === 'string' && r.length > 0) || ''
  return rol.toLowerCase()
}

// GET /api/auth/me — devuelve perfil completo con roles.nombre y cliente{}
async function fetchPerfil() {
  try {
    const { data } = await getPerfilMe()
    return data?.data || data?.user || data?.usuario || data
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken]     = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  // Valida el token almacenado al montar — cierra sesión automáticamente si expiró
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) return
    getPerfilMe().catch((err) => {
      const status = err.response?.status
      if (status === 401 || status === 403) logout()
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function _persistLogin(tk, userFromResponse) {
    localStorage.setItem('token', tk)
    setToken(tk)

    // Intentar obtener perfil completo desde /auth/me (tiene roles.nombre y cliente{})
    const perfil = await fetchPerfil()

    // Determinar rol — usar ROLE_MAP cuando /auth/me devuelve nombre de rol del backend
    // (ej: 'PROPIETARIO') que no coincide con los roles del frontend ('admin','operador','cliente')
    const FRONTEND_ROLES = ['admin', 'operador', 'cliente']
    let rol = extraerRol(perfil)
    if (!rol || !FRONTEND_ROLES.includes(rol)) {
      const jwtPayload = decodeJWT(tk)
      const rol_id = userFromResponse?.rol_id ?? jwtPayload?.rol_id
      rol = ROLE_MAP[rol_id] || 'cliente'
    }

    const userFinal = {
      id:         userFromResponse?.id,
      nombre:     perfil?.nombre     || userFromResponse?.nombre     || '',
      email:      perfil?.email      || userFromResponse?.email      || '',
      rol_id:     userFromResponse?.rol_id,
      cliente_id: userFromResponse?.cliente_id ?? perfil?.cliente?.id ?? null,
      _rol:       rol,
      ...perfil,
    }

    localStorage.setItem('user', JSON.stringify(userFinal))
    setUser(userFinal)
    return { ok: true, user: userFinal, rol }
  }

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiLogin({ email, password })
      const tk = data?.token || data?.accessToken || data?.access_token
      if (!tk) throw new Error('El servidor no devolvió un token válido')
      return await _persistLogin(tk, data?.user)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Credenciales incorrectas'
      setError(msg)
      return { ok: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  async function register(nombre, telefono, email, password, direccion) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiRegisterCliente({ nombre, email, password, telefono, direccion })
      const tk = data?.token || data?.accessToken || data?.access_token
      if (!tk) throw new Error('Error al crear cuenta')
      return await _persistLogin(tk, data?.user)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al registrar'
      setError(msg)
      return { ok: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const userRol    = user?._rol || ''
  const isAdmin    = userRol === 'admin'
  const isOperador = userRol === 'operador'
  const isCliente  = userRol === 'cliente'

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      isAdmin, isOperador, isCliente,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
