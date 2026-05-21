import { useState, useEffect, useCallback } from 'react'
import { getMisPedidos } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import Pagination from '../admin/shared/Pagination'

const ACCENT = '#e8781a'
const limit   = 10

const ESTADO_CONFIG = {
  PENDIENTE_CONFIRMACION: { label: 'Pendiente confirmación', color: '#f59e0b', bg: '#fffbeb' },
  CONFIRMADO:             { label: 'Confirmado',             color: '#10b981', bg: '#ecfdf5' },
  EN_RUTA:                { label: 'En camino',              color: '#3b82f6', bg: '#eff6ff' },
  ENTREGADO:              { label: 'Entregado',              color: '#6b7280', bg: '#f9fafb' },
  CANCELADO:              { label: 'Cancelado',              color: '#ef4444', bg: '#fef2f2' },
}

export default function ClientePedidos({ refresh }) {
  const [pedidos, setPedidos]   = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    getMisPedidos({ page, limit })
      .then(r => { setPedidos(toArr(r.data)); setTotal(toTotal(r.data)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { cargar() }, [cargar, refresh])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (loading) return <p style={{ color: '#888' }}>Cargando pedidos...</p>

  if (pedidos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#555' }}>No tienes pedidos aún</h3>
        <p style={{ color: '#888' }}>¡Haz tu primer pedido desde la tienda!</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {pedidos.map(p => {
          const cfg = ESTADO_CONFIG[p.estado] || { label: p.estado, color: '#888', bg: '#f9fafb' }
          return (
            <div key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)}
              style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', border: selected?.id === p.id ? `2px solid ${ACCENT}` : '2px solid transparent', transition: 'border 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Pedido #{p.id}</p>
                  <p style={{ fontSize: '0.8rem', color: '#888', margin: '0.2rem 0 0' }}>
                    {new Date(p.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: ACCENT }}>${parseFloat(p.total || 0).toFixed(2)}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '20px', color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* Detalles expandibles */}
              {selected?.id === p.id && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                  {p.detalle_pedido?.map(d => (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#555', marginBottom: '0.3rem' }}>
                      <span>{d.productos?.nombre || `Producto #${d.producto_id}`} × {d.cantidad}</span>
                      <span>${parseFloat(d.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  {p.direccion_entrega && (
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                      📍 {p.direccion_entrega}
                    </p>
                  )}
                  {p.estado === 'PENDIENTE_CONFIRMACION' && (
                    <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.5rem', fontWeight: 600 }}>
                      ⏳ Responde <strong>SI</strong> o <strong>NO</strong> en WhatsApp para confirmar tu pedido
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
