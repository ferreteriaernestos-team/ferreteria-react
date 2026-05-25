import { useState, useEffect } from 'react'
import { getEstadoCaja, abrirCaja, getVentas, getInventarioCriticos } from '../../services/api'
import { toArr } from '../../utils/parseResponse'
import Modal from '../admin/shared/Modal'
import * as Icons from '../admin/shared/Icons'

const METODOS = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' }

/* ── Sub-components ─────────────────────────────────────────── */

function StatCard({ label, value, Icon: Ic, iconColor, iconBg, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: iconBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Ic size={22} color={iconColor} />
      </div>
      <div>
        <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0 0 0.2rem', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: '1.7rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#111827', lineHeight: 1, margin: 0 }}>
          {value}
        </p>
        {sub && <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0.2rem 0 0' }}>{sub}</p>}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f3f4f6', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: '12px', width: '80px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.5rem' }} />
        <div style={{ height: '28px', width: '100px', background: '#f3f4f6', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

function EstadoBadge({ estado }) {
  const ok = estado === 'COMPLETADA'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
      background: ok ? '#ecfdf5' : '#fef2f2',
      color: ok ? '#059669' : '#dc2626',
    }}>
      {ok ? <Icons.CheckCircle size={10} /> : <Icons.X size={10} />}
      {estado || 'COMPLETADA'}
    </span>
  )
}

/* ── Main component ─────────────────────────────────────────── */

function OperadorDashboard({ onSectionChange }) {
  const [caja, setCaja]         = useState(null)
  const [ventas, setVentas]     = useState([])
  const [criticos, setCriticos] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Modal abrir caja
  const [showModal, setShowModal]       = useState(false)
  const [montoInicial, setMontoInicial] = useState('')
  const [abriendo, setAbriendo]         = useState(false)
  const [modalError, setModalError]     = useState(null)

  function cargarDatos() {
    setLoading(true)
    setError(null)
    Promise.all([
      getEstadoCaja().catch(() => ({ data: null })),
      getVentas({ limit: 10 }).catch(() => ({ data: null })),
      getInventarioCriticos().catch(() => ({ data: [] })),
    ]).then(([cajaRes, ventasRes, critRes]) => {
      const cajaData = cajaRes.data?.data || cajaRes.data
      setCaja(cajaData?.estado === 'ABIERTA' ? cajaData : null)
      setVentas(toArr(ventasRes.data?.data || ventasRes.data))
      setCriticos(toArr(critRes.data?.data || critRes.data))
    })
    .catch(() => setError('No se pudieron cargar los datos del turno.'))
    .finally(() => setLoading(false))
  }

  useEffect(() => { cargarDatos() }, [])

  async function handleAbrirCaja() {
    if (!montoInicial || parseFloat(montoInicial) < 0) {
      setModalError('Ingresa un monto de apertura válido'); return
    }
    setAbriendo(true); setModalError(null)
    try {
      await abrirCaja({ monto_inicial: parseFloat(montoInicial) })
      setShowModal(false); setMontoInicial('')
      cargarDatos()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al abrir caja')
    } finally { setAbriendo(false) }
  }

  /* ── Stats ── */
  const ventasHoy = ventas.filter(v => {
    if (!v.created_at) return false
    return new Date(v.created_at).toDateString() === new Date().toDateString()
  })
  const totalHoy    = ventasHoy.reduce((s, v) => s + parseFloat(v.total || 0), 0)
  const cajaAbierta = !!caja

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ height: '76px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ height: '260px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
        <div style={{ height: '260px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
      </div>
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <Icons.AlertTriangle size={40} color="#f87171" style={{ margin: '0 auto 1rem' }} />
      <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>{error}</p>
      <button onClick={cargarDatos} style={{ padding: '0.6rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
        Reintentar
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Banner estado de caja ── */}
      <div style={{
        borderRadius: '12px', padding: '1.25rem 1.5rem',
        background: cajaAbierta ? '#f0fdf4' : '#fff7ed',
        border: `1px solid ${cajaAbierta ? '#bbf7d0' : '#fed7aa'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
            background: cajaAbierta ? '#dcfce7' : '#ffedd5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icons.Wallet size={22} color={cajaAbierta ? '#16a34a' : '#ea580c'} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0, color: cajaAbierta ? '#166534' : '#9a3412' }}>
              Caja {cajaAbierta ? 'abierta' : 'cerrada'}
            </p>
            <p style={{ fontSize: '0.8rem', color: cajaAbierta ? '#4ade80' : '#fb923c', margin: '0.1rem 0 0' }}>
              {cajaAbierta
                ? `Apertura: $${parseFloat(caja.monto_inicial || 0).toFixed(2)} · Desde ${new Date(caja.fecha_apertura).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
                : 'Abre tu caja para registrar ventas'
              }
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!cajaAbierta && (
            <button
              onClick={() => { setShowModal(true); setModalError(null) }}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                padding: '0.65rem 1.25rem', borderRadius: '8px',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              <Icons.Wallet size={15} /> Abrir caja
            </button>
          )}
          {cajaAbierta && onSectionChange && (
            <button
              onClick={() => onSectionChange('caja')}
              style={{
                background: 'transparent', color: '#166534',
                border: '1.5px solid #86efac',
                padding: '0.6rem 1.1rem', borderRadius: '8px',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              <Icons.BarChart2 size={14} /> Ver caja
            </button>
          )}
        </div>
      </div>

      {/* ── Stats del turno ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard
          label="Ventas hoy"
          value={`$${totalHoy.toFixed(2)}`}
          Icon={Icons.DollarSign}
          iconColor="#16a34a"
          iconBg="#dcfce7"
          sub={`${ventasHoy.length} transaccione${ventasHoy.length !== 1 ? 's' : ''}`}
        />
        <StatCard
          label="Transacciones hoy"
          value={ventasHoy.length}
          Icon={Icons.ClipboardList}
          iconColor="#2563eb"
          iconBg="#dbeafe"
          sub="en este turno"
        />
        <StatCard
          label="Stock crítico"
          value={criticos.length}
          Icon={Icons.AlertTriangle}
          iconColor="#dc2626"
          iconBg="#fee2e2"
          sub={criticos.length === 0 ? 'todo en orden' : 'productos bajos'}
        />
      </div>

      {/* ── Tablas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Últimas ventas */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <Icons.DollarSign size={16} color="var(--accent)" /> Últimas ventas
            </h3>
            {onSectionChange && (
              <button onClick={() => onSectionChange('ventas')} style={{
                background: 'none', border: 'none', color: 'var(--accent)',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}>
                Ver todo <Icons.ChevronRight size={13} />
              </button>
            )}
          </div>
          {ventas.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }}>
                <Icons.DollarSign size={32} color="#e5e7eb" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>Sin ventas registradas</p>
              </div>
            )
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                      {['#', 'Total', 'Método', 'Estado'].map(h => (
                        <th key={h} style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.slice(0, 8).map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid #f9fafb' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fafafa' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>#{v.id}</td>
                        <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)' }}>
                          ${parseFloat(v.total || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.78rem', color: '#6b7280' }}>
                          {METODOS[v.metodo_pago] || v.metodo_pago || '–'}
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem' }}>
                          <EstadoBadge estado={v.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Stock crítico */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <Icons.AlertTriangle size={16} color="#f59e0b" /> Stock crítico
            </h3>
            {onSectionChange && (
              <button onClick={() => onSectionChange('productos')} style={{
                background: 'none', border: 'none', color: 'var(--accent)',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}>
                Ver productos <Icons.ChevronRight size={13} />
              </button>
            )}
          </div>
          {criticos.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }}>
                <Icons.CheckCircle size={32} color="#bbf7d0" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem', margin: 0, fontWeight: 600, color: '#16a34a' }}>¡Todo el stock en orden!</p>
              </div>
            )
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {criticos.slice(0, 6).map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.65rem 0.875rem', borderRadius: '8px',
                    background: '#fff7ed', border: '1px solid #fed7aa',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <Icons.Package size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0, color: '#92400e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.nombre}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: '#b45309', margin: '0.1rem 0 0' }}>Mín: {p.stock_minimo} uds</p>
                      </div>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '20px', flexShrink: 0,
                      background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      {p.stock} uds
                    </span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* ── Modal abrir caja ── */}
      {showModal && (
        <Modal onClose={() => { setShowModal(false); setModalError(null); setMontoInicial('') }} maxWidth="380px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.Wallet size={20} color="var(--accent)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Abrir caja</h3>
          </div>

          {modalError && (
            <div style={{ padding: '0.65rem 0.875rem', borderRadius: '8px', marginBottom: '1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Icons.AlertTriangle size={13} /> {modalError}
            </div>
          )}

          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>
            Monto de apertura *
          </label>
          <input
            type="number" min="0" step="0.01" placeholder="0.00"
            value={montoInicial}
            onChange={e => setMontoInicial(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '0.75rem', border: '1.5px solid #e5e7eb',
              borderRadius: '8px', fontSize: '1rem', outline: 'none',
              boxSizing: 'border-box', fontFamily: 'var(--font-body)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
            onKeyDown={e => { if (e.key === 'Enter') handleAbrirCaja() }}
          />
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.4rem 0 0' }}>
            Introduce el efectivo con el que inicias el turno.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              onClick={handleAbrirCaja}
              disabled={abriendo || !montoInicial}
              style={{
                flex: 1, padding: '0.75rem',
                background: abriendo || !montoInicial ? '#f3f4f6' : 'var(--accent)',
                color: abriendo || !montoInicial ? '#9ca3af' : '#fff',
                border: 'none', borderRadius: '8px', fontWeight: 700,
                cursor: abriendo || !montoInicial ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              }}
            >
              {abriendo ? '⏳ Abriendo...' : <><Icons.Wallet size={15} /> Abrir caja</>}
            </button>
            <button
              onClick={() => { setShowModal(false); setModalError(null); setMontoInicial('') }}
              style={{
                flex: 1, padding: '0.75rem', border: '1.5px solid #e5e7eb',
                borderRadius: '8px', background: '#fff', fontWeight: 600,
                cursor: 'pointer', fontSize: '0.875rem', color: '#374151',
              }}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default OperadorDashboard
