import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminDashboard from '../../components/admin/AdminDashboard'
import AdminProductos from '../../components/admin/AdminProductos'
import AdminCategorias from '../../components/admin/AdminCategorias'
import AdminClientes from '../../components/admin/AdminClientes'
import AdminPedidos from '../../components/admin/AdminPedidos'
import AdminVentas from '../../components/admin/AdminVentas'
import AdminCaja from '../../components/admin/AdminCaja'
import AdminProveedores from '../../components/admin/AdminProveedores'
import AdminOrdenesCompra from '../../components/admin/AdminOrdenesCompra'
import AdminInventario from '../../components/admin/AdminInventario'
import AdminMovimientos from '../../components/admin/AdminMovimientos'
import AdminDescuentos from '../../components/admin/AdminDescuentos'
import AdminReportes from '../../components/admin/AdminReportes'
import AdminWhatsApp from '../../components/admin/AdminWhatsApp'

function AdminPage() {

  const [activeSection, setActiveSection] = useState('dashboard')

  function renderSection() {
    switch (activeSection) {
      case 'dashboard':      return <AdminDashboard />
      case 'productos':      return <AdminProductos />
      case 'categorias':     return <AdminCategorias />
      case 'clientes':       return <AdminClientes />
      case 'pedidos':        return <AdminPedidos />
      case 'ventas':         return <AdminVentas />
      case 'caja':           return <AdminCaja />
      case 'proveedores':    return <AdminProveedores />
      case 'ordenes-compra': return <AdminOrdenesCompra />
      case 'inventario':     return <AdminInventario />
      case 'movimientos':    return <AdminMovimientos />
      case 'descuentos':     return <AdminDescuentos />
      case 'reportes':       return <AdminReportes />
      case 'whatsapp':       return <AdminWhatsApp />
      default:               return <AdminDashboard />
    }
  }

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </AdminLayout>
  )
}

export default AdminPage
