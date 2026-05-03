import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  // Carrito
  function addToCart(product) {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  function changeQty(id, delta) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }

  const cartTotal = cart.reduce((s, i) => s + i.qty, 0)
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  // Wishlist
  function toggleWishlist(product) {
    setWishlist(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.filter(i => i.id !== product.id)
      return [...prev, product]
    })
  }

  function isInWishlist(id) {
    return wishlist.some(i => i.id === id)
  }

  // Búsqueda
  function handleSearch(query, products) {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      setSearchOpen(false)
      return
    }
    const q = query.toLowerCase()
    const results = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
    )
    setSearchResults(results)
    setSearchOpen(true)
  }

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, changeQty, cartTotal, cartSubtotal,
      wishlist, toggleWishlist, isInWishlist,
      cartOpen, setCartOpen,
      wishlistOpen, setWishlistOpen,
      searchQuery, searchResults, searchOpen, setSearchOpen, handleSearch,
      authOpen, setAuthOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}