import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCarritoAPI, addCarritoItem, updateCarritoItem, removeCarritoItem, clearCarritoAPI } from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

function getOrCreateSessionId() {
  let sid = localStorage.getItem('cart_session_id')
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem('cart_session_id', sid)
  }
  return sid
}

export function CartProvider({ children }) {
  const { user }                = useAuth()
  const cliente_id              = user?.cliente_id ?? null

  const [sessionId]             = useState(getOrCreateSessionId)
  const [cart, setCart]         = useState({ items: [], subtotal: 0, total_items: 0 })
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchOpen, setSearchOpen]     = useState(false)
  const [authOpen, setAuthOpen]         = useState(false)
  const [toasts, setToasts]             = useState([])
  const [cartLoading, setCartLoading]   = useState(false)

  // ── Toasts ──────────────────────────────────────────────────────────────────
  function showToast(message) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message }])
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // ── Sync carrito desde API ───────────────────────────────────────────────────
  const syncCart = useCallback(async () => {
    try {
      const { data } = await getCarritoAPI(sessionId, cliente_id || undefined)
      if (data?.data) setCart(data.data)
    } catch { /* carrito vacío o sin conexión — ignorar */ }
  }, [sessionId, cliente_id])

  useEffect(() => { syncCart() }, [syncCart])

  // ── Carrito ─────────────────────────────────────────────────────────────────
  async function addToCart(product, qty = 1) {
    setCartLoading(true)
    try {
      const currentItem = cart.items?.find(i => i.producto_id === product.id)
      const newQty = (currentItem?.cantidad || 0) + qty
      const { data } = await addCarritoItem(sessionId, product.id, newQty, cliente_id)
      if (data?.data) setCart(data.data)
      showToast(`${product.nombre || product.name || 'Producto'} agregado al carrito`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al agregar al carrito')
    } finally { setCartLoading(false) }
  }

  async function removeFromCart(producto_id) {
    setCartLoading(true)
    try {
      const { data } = await removeCarritoItem(sessionId, producto_id)
      if (data?.data) setCart(data.data)
    } catch { /* ignorar */ } finally { setCartLoading(false) }
  }

  async function changeQty(producto_id, newQty) {
    if (newQty <= 0) { removeFromCart(producto_id); return }
    setCartLoading(true)
    try {
      const { data } = await updateCarritoItem(sessionId, producto_id, newQty)
      if (data?.data) setCart(data.data)
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar cantidad')
    } finally { setCartLoading(false) }
  }

  async function clearCart() {
    setCartLoading(true)
    try {
      await clearCarritoAPI(sessionId)
      setCart({ items: [], subtotal: 0, total_items: 0 })
    } catch { /* ignorar */ } finally { setCartLoading(false) }
  }

  const cartTotal    = cart.total_items ?? 0
  const cartSubtotal = cart.subtotal    ?? 0

  // ── Wishlist ─────────────────────────────────────────────────────────────────
  function toggleWishlist(product) {
    const exists = wishlist.find(i => i.id === product.id)
    if (exists) {
      setWishlist(prev => prev.filter(i => i.id !== product.id))
      showToast(`${product.nombre || product.name} eliminado de favoritos`)
    } else {
      setWishlist(prev => [...prev, product])
      showToast(`${product.nombre || product.name} agregado a favoritos`)
    }
  }

  function isInWishlist(id) {
    return wishlist.some(i => i.id === id)
  }

  // ── Búsqueda ─────────────────────────────────────────────────────────────────
  function handleSearch(query, products) {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      setSearchOpen(false)
      return
    }
    const q = query.toLowerCase()
    const results = products.filter(p =>
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.marca  || '').toLowerCase().includes(q) ||
      (p.categorias?.nombre || '').toLowerCase().includes(q)
    )
    setSearchResults(results)
    setSearchOpen(true)
  }

  return (
    <CartContext.Provider value={{
      sessionId, cliente_id,
      cart, addToCart, removeFromCart, changeQty, clearCart, cartLoading, syncCart,
      cartTotal, cartSubtotal,
      wishlist, toggleWishlist, isInWishlist,
      cartOpen, setCartOpen,
      wishlistOpen, setWishlistOpen,
      searchQuery, searchResults, searchOpen, setSearchOpen, handleSearch,
      authOpen, setAuthOpen,
      toasts, showToast, removeToast,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
