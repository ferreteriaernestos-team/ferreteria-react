# CLAUDE.md

**Guía de inicio rápido — Ferretería Ernesto's**

---

## Descripción del Proyecto

E-commerce de ferretería con panel de administración completo.

**Stack frontend**: React 18, React Router v6, Axios, Vite, CSS personalizado (sin Tailwind)  
**Backend**: Node.js / Express + JWT (`/home/nova/Desktop/backend-ferreteria`)  
**Frontend**: `/home/nova/Desktop/ferreteria-react/ferreteria-react`

---

## Protocolo de inicio ⚡

**OBLIGATORIO** al inicio de cada sesión:

```
✓ .claude/COMMON_MISTAKES.md    # ⚠️ CRÍTICO — leer PRIMERO
✓ .claude/QUICK_START.md        # Comandos esenciales
✓ .claude/ARCHITECTURE_MAP.md   # Dónde está cada cosa
```

**Al terminar una tarea:**
- Crear doc en `.claude/completions/YYYY-MM-DD-nombre-tarea.md`
- Mover sesión a `.claude/sessions/archive/` si se creó

**⚠️ NUNCA cargar automáticamente:**
- `.claude/completions/`  → 0 tokens
- `.claude/sessions/`     → 0 tokens
- `docs/archive/`         → 0 tokens

---

## Comandos rápidos

```bash
# Frontend
cd /home/nova/Desktop/ferreteria-react/ferreteria-react
npm run dev        # http://localhost:5173
npm run build

# Backend
cd /home/nova/Desktop/backend-ferreteria
npm run dev        # http://localhost:3000
```

Ver `.claude/QUICK_START.md` para referencia completa.

---

## Navegación de documentación

- **Errores comunes**: `.claude/COMMON_MISTAKES.md` ⚠️ **OBLIGATORIO**
- **Comandos**: `.claude/QUICK_START.md`
- **Arquitectura**: `.claude/ARCHITECTURE_MAP.md`
- **Índice completo**: `docs/INDEX.md`

---

**Última actualización**: 2026-05-23  
**Optimizado con**: [Claude Token Optimizer](https://github.com/nadimtuhin/claude-token-optimizer)
