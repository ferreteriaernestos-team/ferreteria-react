# Comandos rápidos

**Comandos esenciales — Ferretería Ernesto's**

---

## Desarrollo

```bash
# Frontend (React / Vite)
cd /home/nova/Desktop/ferreteria-react/ferreteria-react
npm run dev            # Inicia en http://localhost:5173
npm run build          # Build de producción → dist/
npm run preview        # Preview del build

# Backend (Express)
cd /home/nova/Desktop/backend-ferreteria
npm run dev            # Inicia en http://localhost:3000
```

## Variables de entorno (frontend)

```bash
# Archivo: ferreteria-react/.env
VITE_API_URL=http://localhost:3000/api
```

## Flujos comunes

1. **Nuevo componente admin**:
   - Crear `src/components/admin/AdminNuevo.jsx`
   - Importar y agregar `case` en `src/pages/admin/AdminPage.jsx`
   - Agregar entrada en `navItems` de `src/components/admin/AdminLayout.jsx`

2. **Nuevo endpoint de API**:
   - Agregar función en `src/services/api.js`
   - Usar en el componente con `import { fn } from '../../services/api'`

3. **Nuevo ícono admin**:
   - Agregar `export const NombreIcono = base(<>...</>)` en `src/components/admin/shared/Icons.jsx`
   - Agregar al objeto `export default Icons` al final del mismo archivo

---

**Última actualización**: 2026-05-23
