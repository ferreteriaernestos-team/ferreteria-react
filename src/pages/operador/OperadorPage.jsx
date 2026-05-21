import { useState } from 'react'
import OperadorLayout from '../../components/operador/OperadorLayout'
import OperadorDashboard from '../../components/operador/OperadorDashboard'
import AdminCaja from '../../components/admin/AdminCaja'
import AdminVentas from '../../components/admin/AdminVentas'
import AdminClientes from '../../components/admin/AdminClientes'
import AdminPedidos from '../../components/admin/AdminPedidos'
import ProductosView from '../../components/operador/ProductosView'

function OperadorPage() {
  const [activeSection, setActiveSection] = useState('dashboard')

  function renderSection() {
    switch (activeSection) {
      case 'dashboard': return <OperadorDashboard />
      case 'caja':      return <AdminCaja />
      case 'ventas':    return <AdminVentas />
      case 'clientes':  return <AdminClientes />
      case 'productos': return <ProductosView />
      case 'pedidos':   return <AdminPedidos />
      default:          return <OperadorDashboard />
    }
  }

  return (
    <OperadorLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </OperadorLayout>
  )
}

export default OperadorPage
