import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ClienteLayout from '../../components/cliente/ClienteLayout'
import ClienteTienda from '../../components/cliente/ClienteTienda'
import ClienteCarrito from '../../components/cliente/ClienteCarrito'
import ClientePedidos from '../../components/cliente/ClientePedidos'
import ClientePerfil from '../../components/cliente/ClientePerfil'

export default function ClientePage() {
  const { user, isAdmin, isOperador } = useAuth()
  const location = useLocation()
  const [section, setSection]         = useState(location.state?.section || 'tienda')
  const [pedidosRefresh, setPedidosRefresh] = useState(0)

  // Navigate to section when redirected from cart with state
  useEffect(() => {
    if (location.state?.section) setSection(location.state.section)
  }, [location.state?.section])

  // Redirigir si no está autenticado o tiene otro rol
  if (!user)       return <Navigate to="/"       replace />
  if (isAdmin)     return <Navigate to="/admin"   replace />
  if (isOperador)  return <Navigate to="/operador" replace />

  function handlePedidoCreado() {
    setPedidosRefresh(n => n + 1)
    setSection('pedidos')
  }

  function renderSection() {
    switch (section) {
      case 'tienda':
        return <ClienteTienda />
      case 'carrito':
        return <ClienteCarrito onPedidoCreado={handlePedidoCreado} />
      case 'pedidos':
        return <ClientePedidos refresh={pedidosRefresh} />
      case 'perfil':
        return <ClientePerfil />
      default:
        return <ClienteTienda />
    }
  }

  return (
    <ClienteLayout section={section} onSection={setSection}>
      {renderSection()}
    </ClienteLayout>
  )
}
