import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminDashboard from '../../components/admin/AdminDashboard'
import AdminProductos from '../../components/admin/AdminProductos'
import AdminPedidos from '../../components/admin/AdminPedidos'
import AdminUsuarios from '../../components/admin/AdminUsuarios'
import AdminReportes from '../../components/admin/AdminReportes'

function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard')

  function renderSection() {
    switch (activeSection) {
      case 'dashboard': return <AdminDashboard />
      case 'productos': return <AdminProductos />
      case 'pedidos':   return <AdminPedidos />
      case 'usuarios':  return <AdminUsuarios />
      case 'reportes':  return <AdminReportes />
      default:          return <AdminDashboard />
    }
  }

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </AdminLayout>
  )
}

export default AdminPage