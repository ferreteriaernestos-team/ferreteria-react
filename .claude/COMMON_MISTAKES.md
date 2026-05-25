# Errores Comunes

**⚠️ CRÍTICO — Leer al inicio de cada sesión (2 min = 2 horas ahorradas)**

---

## Top 5 errores críticos

### 1. `??` con operadores de comparación (`>`, `<`, `===`)

**Síntoma**: La lógica de fallback nunca se ejecuta.  
**Causa**: `product.stock > 0` devuelve `true`/`false`, nunca `null`/`undefined` — `??` no hace nada.  
**Fix**:
```js
// ❌ MAL
const enStock = product.stock > 0 ?? product.inStock ?? true
// ✅ BIEN
const enStock = product.stock != null ? product.stock > 0 : (product.inStock ?? true)
```

---

### 2. Componente admin creado pero no conectado a `AdminPage.jsx`

**Síntoma**: El menú lateral muestra el enlace pero al hacer clic no renderiza nada.  
**Fix** — siempre 3 pasos juntos:
1. Crear `src/components/admin/AdminNuevo.jsx`
2. Importar en `src/pages/admin/AdminPage.jsx`
3. Agregar `case 'nueva-seccion': return <AdminNuevo />` en el switch

---

### 3. Función de API usada pero no definida en `api.js`

**Síntoma**: `is not a function` o crash al importar desde `../../services/api`.  
**Fix**: Agregar el endpoint en `src/services/api.js` **antes** de usarlo en el componente.

---

### 4. `<a href="#">` hace scroll al top de la página

**Síntoma**: Al hacer clic en links de menú o modales, la página sube al inicio.  
**Fix**:
```jsx
// ❌ MAL  →  <a href="#">Texto</a>
// ✅ Acción  →  <button type="button" onClick={fn}>Texto</button>
// ✅ Ruta    →  <Link to="/ruta">Texto</Link>
```

---

### 5. Ícono usado sin exportar en `Icons.jsx`

**Síntoma**: `Icons.Nombre is not a function` — pantalla en blanco o crash.  
**Fix**: Verificar que el ícono está en `src/components/admin/shared/Icons.jsx` Y en el `export default Icons` al final del archivo.

---

**Actualizar cuando:** bug tardó >1 hora · podría llegar a producción · patrón se repitió  
**Última actualización**: 2026-05-23
