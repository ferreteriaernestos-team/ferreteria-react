# TODO - Ferretería React

## ✅ Completado

### WhatsApp QR/Status UI
- [x] Backend: GET /api/whatsapp/status — implementado en `whatsapp.controller.ts`
- [x] Backend: GET /api/whatsapp/qr — implementado en `whatsapp.controller.ts`
- [x] Backend: POST /api/whatsapp/qr/regenerar — implementado en `whatsapp.controller.ts`
- [x] Backend guarda último QR en `lastQrDataUrl` (whatsapp.service.ts)
- [x] Rutas registradas en `backend/src/app.ts` bajo `/api/whatsapp`
- [x] Frontend `AdminWhatsApp.jsx` consume los endpoints correctamente
- [x] `getWhatsAppQr`, `getWhatsAppStatus`, `regenerateWhatsAppQr` en `services/api.js`

### Módulo Operador
- [x] OperadorDashboard.jsx — rediseñado con Icons.jsx, skeletons, modales
- [x] OperadorCaja.jsx — caja por usuario, sin conflicto con admin
- [x] ProductosView.jsx — filtros, búsqueda, badges de stock
- [x] Bug fix: cerrar caja usaba historial ajeno → ahora usa flag `abierta`
- [x] Monto de cierre calculado automáticamente en backend

### Páginas Públicas
- [x] HomePage.jsx — carga real de productos y categorías desde API
- [x] MarcasPage.jsx — lista de marcas con conteo de productos
- [x] MarcaPage.jsx — página individual de marca con paginación
- [x] PromocionesPage.jsx — descuentos activos y productos destacados
- [x] CategoriaPage.jsx — por ID numérico o nombre (legacy)
- [x] IdeasPage.jsx — rediseño visual con filtros por tags
- [x] Backend: eliminado authMiddleware de GET /products, GET /categorias, GET /descuentos

### Admin Clientes
- [x] Historial de pedidos: tabla paginada (6/página) en lugar de dropdowns
- [x] "Ver detalles" abre modal con lista de productos, dirección y total

---

## 📌 Pendiente

*(Sin ítems pendientes)*
