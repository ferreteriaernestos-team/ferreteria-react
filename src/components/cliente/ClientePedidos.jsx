import { useState, useEffect, useCallback } from 'react'
import { getMisPedidos } from '../../services/api'
import { toArr, toTotal } from '../../utils/parseResponse'
import Pagination from '../admin/shared/Pagination'
import * as Icons from '../admin/shared/Icons'

const limit = 10

const ESTADO_CONFIG = {
  PENDIENTE_CONFIRMACION: { label: 'Pendiente confirmación', color: '#d97706', bg: '#fffbeb', Icon: Icons.Clock },
  CONFIRMADO:             { label: 'Confirmado',             color: '#059669', bg: '#ecfdf5', Icon: Icons.CheckCircle },
  EN_RUTA:                { label: 'En camino',              color: '#2563eb', bg: '#eff6ff', Icon: Icons.Truck },
  ENTREGADO:              { label: 'Entregado',              color: '#6b7280', bg: '#f9fafb', Icon: Icons.Package },
  CANCELADO:              { label: 'Cancelado',              color: '#dc2626', bg: '#fef2f2', Icon: Icons.X },
}

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', ...style }}>
      {children}
    </div>
  )
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { label: estado, color: '#6b7280', bg: '#f9fafb', Icon: Icons.Clock }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontSize: '0.72rem', fontWeight: 700,
      padding: '0.25rem 0.65rem', borderRadius: '20px',
      color: cfg.color, background: cfg.bg,
    }}>
      <cfg.Icon size={11} />
      {cfg.label}
    </span>
  )
}

export default function ClientePedidos({ refresh }) {
  const [pedidos, setPedidos]   = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [selected, setSelected] = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    setError(null)
    getMisPedidos({ page, limit })
      .then(r => {
        setPedidos(toArr(r.data))
        setTotal(toTotal(r.data))
      })
      .catch(err => {
        const msg = err?.response?.data?.message || err?.response?.data?.error || ''
        if (msg.toLowerCase().includes('perfil de cliente')) {
          setError('Tu cuenta no tiene un perfil de cliente vinculado. Contacta al administrador.')
        } else {
          setError('No se pudieron cargar tus pedidos. Intenta de nuevo.')
        }
      })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { cargar() }, [cargar, refresh])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ height: '16px', width: '120px', background: '#f3f4f6', borderRadius: '4px' }} />
                <div style={{ height: '12px', width: '160px', background: '#f3f4f6', borderRadius: '4px' }} />
              </div>
              <div style={{ height: '22px', width: '120px', background: '#f3f4f6', borderRadius: '20px' }} />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <Card style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <Icons.AlertTriangle size={40} color="#f87171" style={{ margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>{error}</p>
        <button
          onClick={cargar}
          style={{
            marginTop: '0.5rem', padding: '0.6rem 1.25rem',
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: '8px',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
          }}
        >
          Reintentar
        </button>
      </Card>
    )
  }

  // ── Vacío ──
  if (pedidos.length === 0) {
    return (
      <Card style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <Icons.ClipboardList size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem', fontSize: '1.05rem' }}>
          No tienes pedidos aún
        </p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>¡Haz tu primer pedido desde la tienda!</p>
      </Card>
    )
  }

  return (
    <div>
      {/* Resumen rápido */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: total, color: '#374151', Icon: Icons.ClipboardList },
          { label: 'Pendientes', value: pedidos.filter(p => p.estado === 'PENDIENTE_CONFIRMACION').length, color: '#d97706', Icon: Icons.Clock },
          { label: 'Confirmados', value: pedidos.filter(p => p.estado === 'CONFIRMADO').length, color: '#059669', Icon: Icons.CheckCircle },
          { label: 'Entregados', value: pedidos.filter(p => p.estado === 'ENTREGADO').length, color: '#6b7280', Icon: Icons.Package },
        ].map(stat => (
          <Card key={stat.label} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <stat.Icon size={14} color={stat.color} />
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>{stat.label}</span>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</span>
          </Card>
        ))}
      </div>

      {/* Lista de pedidos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {pedidos.map(p => {
          const isOpen = selected?.id === p.id
          return (
            <Card
              key={p.id}
              style={{
                border: isOpen ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
              }}
            >
              {/* Cabecera */}
              <div
                onClick={() => setSelected(isOpen ? null : p)}
                style={{ padding: '1.1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: '#f8fafc', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icons.ClipboardList size={16} color="#9ca3af" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, color: '#111827' }}>
                      Pedido #{p.id}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0.1rem 0 0' }}>
                      {new Date(p.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>
                    ${parseFloat(p.total || 0).toFixed(2)}
                  </span>
                  <EstadoBadge estado={p.estado} />
                  <Icons.ChevronDown
                    size={15}
                    color="#9ca3af"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                </div>
              </div>

              {/* Detalle expandible */}
              {isOpen && (
                <div style={{ padding: '0 1.25rem 1.25rem' }}>
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>

                    {/* Productos */}
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      Productos
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.875rem' }}>
                      {p.detalle_pedido?.map(d => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151' }}>
                            {d.productos?.imagen
                              ? <img src={d.productos.imagen} alt="" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                              : <div style={{ width: '28px', height: '28px', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Icons.Package size={12} color="#9ca3af" />
                                </div>
                            }
                            <span>{d.productos?.nombre || `Producto #${d.producto_id}`}</span>
                            <span style={{ color: '#9ca3af' }}>× {d.cantidad}</span>
                          </div>
                          <span style={{ fontWeight: 600, color: '#374151' }}>
                            ${parseFloat(d.subtotal || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Dirección */}
                    {p.direccion_entrega && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        <Icons.MapPin size={13} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                        {p.direccion_entrega}
                      </div>
                    )}

                    {/* Alerta WhatsApp */}
                    {p.estado === 'PENDIENTE_CONFIRMACION' && (
                      <div style={{
                        background: '#fffbeb', border: '1px solid #fcd34d',
                        borderRadius: '8px', padding: '0.75rem 1rem',
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        fontSize: '0.8rem', color: '#92400e', marginTop: '0.75rem',
                      }}>
                        <Icons.Clock size={14} style={{ flexShrink: 0, marginTop: '0.05rem' }} />
                        <span>
                          Responde <strong>SI</strong> o <strong>NO</strong> en WhatsApp para confirmar tu pedido.
                          Tienes <strong>30 minutos</strong> antes de que expire.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
