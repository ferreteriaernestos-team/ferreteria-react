import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el JWT en cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirige al login si el token expiró
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login          = (data) => api.post('/auth/login', data)
export const register       = (data) => api.post('/auth/register', data)
export const getUsuarioById = (id)   => api.get(`/users/${id}`)
export const getPerfilMe    = ()     => api.get('/auth/me')

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard')

// ── Productos ─────────────────────────────────────────────────────────────────
export const getProductos      = (params) => api.get('/products', { params })
export const getProducto       = (id)     => api.get(`/products/${id}`)
export const getMarcas         = ()       => api.get('/products/marcas')
export const createProducto    = (data)   => api.post('/products', data)
export const updateProducto    = (id, data) => api.put(`/products/${id}`, data)
export const deleteProducto    = (id)     => api.delete(`/products/${id}`)

// ── Categorías ────────────────────────────────────────────────────────────────
export const getCategorias     = ()       => api.get('/categorias')
export const getCategoria      = (id)     => api.get(`/categorias/${id}`)
export const createCategoria   = (data)   => api.post('/categorias', data)
export const updateCategoria   = (id, data) => api.put(`/categorias/${id}`, data)
export const deleteCategoria   = (id)     => api.delete(`/categorias/${id}`)

// ── Clientes ──────────────────────────────────────────────────────────────────
export const getClientes       = (params) => api.get('/clientes', { params })
export const getCliente        = (id)     => api.get(`/clientes/${id}`)
export const buscarCliente     = (documento) => api.get('/clientes/buscar', { params: { documento } })
export const createCliente     = (data)   => api.post('/clientes', data)
export const updateCliente     = (id, data) => api.put(`/clientes/${id}`, data)
export const deleteCliente     = (id)     => api.delete(`/clientes/${id}`)

// ── Proveedores ───────────────────────────────────────────────────────────────
export const getProveedores    = (params) => api.get('/proveedores', { params })
export const getProveedor      = (id)     => api.get(`/proveedores/${id}`)
export const createProveedor   = (data)   => api.post('/proveedores', data)
export const updateProveedor   = (id, data) => api.put(`/proveedores/${id}`, data)
export const deleteProveedor   = (id)     => api.delete(`/proveedores/${id}`)

// ── Descuentos ────────────────────────────────────────────────────────────────
export const getDescuentos     = (params) => api.get('/descuentos', { params })
export const getDescuento      = (id)     => api.get(`/descuentos/${id}`)
export const createDescuento   = (data)   => api.post('/descuentos', data)
export const updateDescuento   = (id, data) => api.put(`/descuentos/${id}`, data)
export const deleteDescuento   = (id)     => api.delete(`/descuentos/${id}`)

// ── Inventario ────────────────────────────────────────────────────────────────
export const getInventarioCriticos = () => api.get('/inventario/criticos')

// ── Movimientos ───────────────────────────────────────────────────────────────
export const getMovimientos    = (params) => api.get('/movimientos', { params })
export const createMovimiento  = (data)   => api.post('/movimientos', data)

// ── Órdenes de Compra ─────────────────────────────────────────────────────────
export const getOrdenesCompra  = (params) => api.get('/ordenes-compra', { params })
export const getOrdenCompra    = (id)     => api.get(`/ordenes-compra/${id}`)
export const createOrdenCompra = (data)   => api.post('/ordenes-compra', data)
export const recibirOrdenCompra= (id, data) => api.put(`/ordenes-compra/${id}/recibir`, data)

// ── Pedidos ───────────────────────────────────────────────────────────────────
export const getPedidos        = (params) => api.get('/pedidos', { params })
export const getPedido         = (id)     => api.get(`/pedidos/${id}`)
export const createPedido      = (data)   => api.post('/pedidos', data)
export const actualizarEstadoPedido = (id, data) => api.patch(`/pedidos/${id}/estado`, data)
export const confirmarPedido   = (id)     => api.patch(`/pedidos/${id}/confirmar`)
export const cancelarPedido    = (id)     => api.patch(`/pedidos/${id}/cancelar`)

// ── Ventas ────────────────────────────────────────────────────────────────────
export const getVentas         = (params) => api.get('/ventas', { params })
export const getVenta          = (id)     => api.get(`/ventas/${id}`)
export const createVenta       = (data)   => api.post('/ventas', data)
export const cancelarVenta     = (id)     => api.put(`/ventas/${id}/cancelar`)

// ── Caja ──────────────────────────────────────────────────────────────────────
export const getEstadoCaja     = ()       => api.get('/caja/estado')
export const getHistorialCaja  = ()       => api.get('/caja/historial')
export const abrirCaja         = (data)   => api.post('/caja/abrir', data)
export const cerrarCaja        = (data)   => api.put('/caja/cerrar', data)

// ── Reportes ──────────────────────────────────────────────────────────────────
export const getReporteCaja    = (id)     => api.get(`/reportes/caja/${id}`)
export const getReporteDiario  = ()       => api.get('/reportes/diario')
export const getReporteMensual = ()       => api.get('/reportes/mensual')
export const getTopProductos   = ()       => api.get('/reportes/top-productos')

export default api
