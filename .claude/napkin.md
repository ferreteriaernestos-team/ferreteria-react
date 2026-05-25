# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

---

## Execution & Validation (Highest Priority)

1. **[2026-05-23] Node.js v18 — Vite build falla con `CustomEvent is not defined`**
   Do instead: No usar `npm run build` para validar cambios. Leer los archivos directamente y verificar imports/exports con `grep`.

2. **[2026-05-23] `react-doctor` y herramientas npm de análisis React no funcionan en el directorio del backend**
   Do instead: Siempre cambiar al directorio del frontend (`ferreteria-react/ferreteria-react`) antes de correr herramientas de análisis React.

3. **[2026-05-23] El hook `Stop` de `.claude/settings.json` requiere reabrir `/hooks` o reiniciar Claude para activarse en la sesión actual**
   Do instead: Informar al usuario que abra `/hooks` una vez para que el hook entre en efecto sin reiniciar.

---

## Domain Behavior Guardrails

1. **[2026-05-23] `??` con resultado de operador de comparación nunca hace fallback**
   Do instead: `product.stock > 0 ?? x` → `product.stock != null ? product.stock > 0 : x`. El operador `??` solo actúa sobre `null`/`undefined`, nunca sobre `true`/`false`.

2. **[2026-05-23] Nuevo componente admin creado sin conectar en `AdminPage.jsx`**
   Do instead: Siempre hacer los 3 pasos juntos — crear componente → importar en `AdminPage.jsx` → agregar `case` en el switch. Verificar que `navItems` en `AdminLayout.jsx` también tenga la entrada.

3. **[2026-05-23] Función de API usada en componente pero no definida en `api.js`**
   Do instead: Antes de crear cualquier componente que llame a la API, buscar con `grep` si la función ya existe en `src/services/api.js`. Si no, agregarla primero.

4. **[2026-05-23] Ícono referenciado como `Icons.Nombre` sin estar exportado en `Icons.jsx`**
   Do instead: Verificar que el ícono esté en `export const NombreIcono = base(...)` Y en el objeto `export default Icons` al final del archivo. Ambos pasos son obligatorios.

5. **[2026-05-23] `<a href="#">` causa scroll al top de página en modales y menús**
   Do instead: Usar `<button type="button" onClick={fn}>` para acciones sin ruta, o `<Link to="/ruta">` para navegación real. Nunca `href="#"` como placeholder.

---

## Shell & Command Reliability

1. **[2026-05-23] `npx claude-token-optimizer` falla — paquete no publicado en npm registry**
   Do instead: Descargar el script directamente: `curl -fsSL https://raw.githubusercontent.com/nadimtuhin/claude-token-optimizer/main/init.sh -o /tmp/cto-init.sh` y ejecutarlo con `printf "...\n" | bash /tmp/cto-init.sh`.

---

## User Directives

1. **[2026-05-23] El usuario quiere que actualice `.claude/COMMON_MISTAKES.md` automáticamente cuando encuentre bugs importantes**
   Do instead: Al final de cada sesión donde se corrigieron bugs con lógica incorrecta, patrón repetido, o antipatrón del framework, agregar entrada en `.claude/COMMON_MISTAKES.md` con formato `### N. Título / **Síntoma** / **Fix**`.

2. **[2026-05-23] El usuario prefiere respuestas y documentación en español**
   Do instead: Responder siempre en español. Comentarios de código, archivos `.md` de documentación y mensajes de error → en español.
