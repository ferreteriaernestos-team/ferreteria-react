import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, getUsuarioById, getPerfilMe } from '../services/api'

const AuthContext = createContext()

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

// Recorre varias rutas posibles para encontrar el nombre del rol
function extraerRol(obj) {
  if (!obj) return ''
  const candidatos = [
    obj?.roles?.nombre,   // Prisma include: usuarios -> roles -> nombre
    obj?.rol,
    obj?.role,
    obj?.rolNombre,
    obj?.rol_nombre,
  ]
  const rol = candidatos.find(r => typeof r === 'string' && r.length > 0) || ''
  return rol.toLowerCase()
}

// Tras guardar el token en localStorage, intenta obtener el perfil completo del usuario
// Prueba primero /auth/me, luego /users/:id con el id del JWT
async function fetchPerfil(jwtPayload) {
  // Intento 1: endpoint /auth/me (si el backend lo tiene)
  try {
    const { data } = await getPerfilMe()
    return data?.user || data?.usuario || data
  } catch { /* no existe, intentamos con /users/:id */ }

  // Intento 2: /users/:id
  if (jwtPayload?.id) {
    try {
      const { data } = await getUsuarioById(jwtPayload.id)
      return data?.user || data?.usuario || data
    } catch { /* tampoco */ }
  }

  return null
}

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken]   = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiLogin({ email, password })

      // El backend solo devuelve { token }
      const tk = data?.token || data?.accessToken || data?.access_token
      if (!tk) throw new Error('El servidor no devolvió un token válido')

      // Guardamos el token ANTES de las llamadas siguientes para que el interceptor lo adjunte
      localStorage.setItem('token', tk)
      setToken(tk)

      const jwtPayload = decodeJWT(tk)

      // Buscamos el perfil completo (con rol incluido por Prisma)
      const perfil = await fetchPerfil(jwtPayload)

      let rol = extraerRol(perfil)

      // Fallback: si el backend no tiene endpoint de perfil, usamos rol_id
      // En tu schema Prisma, rol_id:1 es tipicamente el admin (primer rol creado)
      if (!rol && jwtPayload?.rol_id) {
        rol = jwtPayload.rol_id === 1 ? 'admin' : 'cliente'
      }

      const userFinal = {
        id:     jwtPayload?.id,
        nombre: perfil?.nombre || perfil?.name || '',
        email:  perfil?.email  || email,
        _rol:   rol,
        ...perfil,
      }

      localStorage.setItem('user', JSON.stringify(userFinal))
      setUser(userFinal)

      console.log('[Auth] JWT payload:', jwtPayload)
      console.log('[Auth] Perfil obtenido:', perfil)
      console.log('[Auth] Rol final:', rol)

      return { ok: true, user: userFinal, rol }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Credenciales incorrectas'
      setError(msg)
      return { ok: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  async function register(nombre, apellido, email, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiRegister({ nombre, apellido, email, password })
      const tk = data?.token || data?.accessToken || data?.access_token
      if (!tk) throw new Error('El servidor no devolvió un token válido')

      localStorage.setItem('token', tk)
      setToken(tk)

      const jwtPayload = decodeJWT(tk)
      const perfil = await fetchPerfil(jwtPayload)
      const rol = extraerRol(perfil) || 'cliente'

      const userFinal = {
        id: jwtPayload?.id,
        nombre: perfil?.nombre || nombre,
        email:  perfil?.email  || email,
        _rol:   rol,
        ...perfil,
      }

      localStorage.setItem('user', JSON.stringify(userFinal))
      setUser(userFinal)

      return { ok: true, user: userFinal, rol }
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

  const isAdmin = (user?._rol || '') === 'admin'

  return (
    <AuthContext.Provider value={{ user, token, loading, error, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
