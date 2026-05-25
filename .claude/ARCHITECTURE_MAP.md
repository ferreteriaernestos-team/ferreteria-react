# Mapa de Arquitectura

**Dónde está cada cosa — Ferretería Ernesto's**

---

## Estructura de directorios

```
ferreteria-react/
├── src/
│   ├── components/
│   │   ├── admin/              # Panel de administración
│   │   │   ├── AdminLayout.jsx     # Sidebar + topbar del admin
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminProductos.jsx
│   │   │   ├── AdminCategorias.jsx
│   │   │   ├── AdminClientes.jsx
│   │   │   ├── AdminPedidos.jsx
│   │   │   ├── AdminVentas.jsx
│   │   │   ├── AdminCaja.jsx
│   │   │   ├── AdminProveedores.jsx
│   │   │   ├── AdminOrdenesCompra.jsx
│   │   │   ├── AdminInventario.jsx
│   │   │   ├── AdminMovimientos.jsx
│   │   │   ├── AdminDescuentos.jsx
│   │   │   ├── AdminReportes.jsx
│   │   │   ├── AdminWhatsApp.jsx
│   │   │   └── shared/
│   │   │       ├── Icons.jsx       # Todos los íconos SVG del admin
│   │   │       ├── Modal.jsx
│   │   │       ├── Pagination.jsx
│   │   │       └── StatusBadge.jsx
│   │   ├── layout/
│   │   │   └── Navbar.jsx          # Mega-menú con departamentos
│   │   └── ui/
│   │       ├── AuthModal.jsx       # Login / Registro
│   │       ├── CartSidebar.jsx     # Carrito lateral
│   │       ├── WishlistSidebar.jsx # Lista de deseos
│   │       └── ProductModal.jsx    # Modal de producto
│   ├── context/
│   │   ├── AuthContext.jsx         # JWT, login, register, logout
│   │   └── CartContext.jsx         # Carrito, wishlist, toasts
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminPage.jsx       # Router del panel admin (switch)
│   │   └── ...otras páginas
│   ├── services/
│   │   └── api.js                  # Todos los llamados Axios al backend
│   └── index.css                   # Estilos globales (sin Tailwind)
```

## Ubicaciones clave

| Qué | Dónde |
|-----|-------|
| Llamadas HTTP a la API | `src/services/api.js` |
| Autenticación (JWT) | `src/context/AuthContext.jsx` |
| Estado del carrito / wishlist | `src/context/CartContext.jsx` |
| Secciones del panel admin | `src/pages/admin/AdminPage.jsx` (switch) |
| Menú lateral admin | `src/components/admin/AdminLayout.jsx` (navItems) |
| Íconos SVG admin | `src/components/admin/shared/Icons.jsx` |
| Estilos globales | `src/index.css` |

## Patrones importantes

### Agregar sección al panel admin
1. `AdminLayout.jsx` → `navItems` array (id + label + Icon)
2. `AdminPage.jsx` → import + case en switch
3. Crear `src/components/admin/AdminNuevo.jsx`

### Agregar ícono
1. `Icons.jsx` → `export const NombreIcono = base(<>...</>)`
2. `Icons.jsx` → agregar al `export default Icons`
3. Usar como `<Icons.NombreIcono size={18} />`

---

**Última actualización**: 2026-05-23
