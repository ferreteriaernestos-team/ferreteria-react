import { useState, useEffect } from 'react'
import { getEstadoCaja, abrirCaja, getVentas, getInventarioCriticos } from '../../services/api'
import { toArr } from '../../utils/parseResponse'
import Modal from '../admin/shared/Modal'

const METODOS = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' }

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.8rem', color: 'var(--subtle)', marginBottom: '0.2rem' }}>{label}</p>
        <p style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 700, color }}>{value}</p>
      </div>
    </div>
  )
}

function OperadorDashboard() {
  const [caja, setCaja]           = useState(null)
  const [ventas, setVentas]       = useState([])
  const [criticos, setCriticos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showAbrirCaja, setShowAbrirCaja] = useState(false)
  const [montoInicial, setMontoInicial]   = useState('')
  const [abriendo, setAbriendo]           = useState(false)

  function cargarDatos() {
    setLoading(true)
    Promise.all([
      getEstadoCaja().catch(() => ({ data: null })),
      getVentas({ limit: 10 }).catch(() => ({ data: null })),
      getInventarioCriticos().catch(() => ({ data: [] })),
    ]).then(([cajaRes, ventasRes, critRes]) => {
      setCaja(cajaRes.data?.data || cajaRes.data?.caja || cajaRes.data)
      setVentas(toArr(ventasRes.data?.data || ventasRes.data))
      setCriticos(toArr(critRes.data?.data || critRes.data))
    })
    .finally(() => setLoading(false))
  }

  useEffect(() => { cargarDatos() }, [])

  async function handleAbrirCaja() {
    if (!montoInicial) return
    setAbriendo(true)
    try {
      await abrirCaja({ monto_inicial: parseFloat(montoInicial) })
      setShowAbrirCaja(false)
      setMontoInicial('')
      cargarDatos()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al abrir caja')
    } finally { setAbriendo(false) }
  }

  const cajaAbierta = caja?.estado === 'ABIERTA'
  const ventasHoy   = ventas.filter(v => {
    if (!v.created_at) return false
    const hoy = new Date()
    const fv  = new Date(v.created_at)
    return fv.toDateString() === hoy.toDateString()
  })
  const totalHoy = ventasHoy.reduce((s, v) => s + parseFloat(v.total || 0), 0)

  if (loading) return <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando...</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Banner estado de caja */}
      <div style={{
        borderRadius: '12px', padding: '1.25rem 1.5rem',
        background: cajaAbierta ? '#e8f5e9' : '#fff3e0',
        border: `1px solid ${cajaAbierta ? '#a5d6a7' : '#ffcc80'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>{cajaAbierta ? '💰' : '🔒'}</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: cajaAbierta ? '#2E7D32' : '#e65100' }}>
              Caja {cajaAbierta ? 'abierta' : 'cerrada'}
            </p>
            {cajaAbierta && caja?.monto_inicial != null && (
              <p style={{ fontSize: '0.8rem', color: 'var(--subtle)' }}>
                Monto inicial: ${parseFloat(caja.monto_inicial).toFixed(2)}
              </p>
            )}
          </div>
        </div>
        {!cajaAbierta && (
          <button onClick={() => setShowAbrirCaja(true)} style={{
            background: '#e65100', color: '#fff', border: 'none',
            padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
          }}>
            Abrir caja
          </button>
        )}
      </div>

      {/* Stats del turno */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard label="Ventas hoy"        value={`$${totalHoy.toFixed(2)}`}  icon="💵" color="#2E7D32" bg="#e8f5e9" />
        <StatCard label="Transacciones hoy" value={ventasHoy.length}            icon="🧾" color="#1565C0" bg="#e3f2fd" />
        <StatCard label="Stock crítico"     value={criticos.length}             icon="⚠️" color="#c62828" bg="#ffebee" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Últimas ventas */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem' }}>💵 Últimas ventas</h3>
          {ventas.length === 0
            ? <p style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>Sin ventas registradas</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['#', 'Total', 'Método', 'Estado'].map(h => (
                      <th key={h} style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--subtle)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ventas.slice(0, 8).map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>#{v.id}</td>
                      <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>${parseFloat(v.total || 0).toFixed(2)}</td>
                      <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.75rem', color: 'var(--subtle)' }}>{METODOS[v.metodo_pago] || v.metodo_pago || '–'}</td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                          background: v.estado === 'COMPLETADA' ? '#e8f5e9' : '#ffebee',
                          color: v.estado === 'COMPLETADA' ? '#2E7D32' : '#c62828',
                        }}>
                          {v.estado || 'COMPLETADA'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        {/* Stock crítico */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem' }}>⚠️ Stock crítico</h3>
          {criticos.length === 0
            ? <p style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>Sin productos en stock crítico</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {criticos.slice(0, 6).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '8px', background: '#fff8e1', border: '1px solid #ffe082' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.nombre}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--subtle)' }}>Mín: {p.stock_minimo}</p>
                    </div>
                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', background: '#ffebee', color: '#c62828', fontSize: '0.75rem', fontWeight: 700 }}>
                      {p.stock} uds
                    </span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* Modal abrir caja */}
      {showAbrirCaja && (
        <Modal onClose={() => setShowAbrirCaja(false)} maxWidth="380px">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem' }}>Abrir caja</h3>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Monto inicial *</label>
          <input
            type="number" min="0" step="0.01" placeholder="0.00"
            value={montoInicial}
            onChange={e => setMontoInicial(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button onClick={handleAbrirCaja} disabled={abriendo || !montoInicial}
              style={{ flex: 1, background: '#e65100', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              {abriendo ? 'Abriendo...' : 'Abrir caja'}
            </button>
            <button onClick={() => setShowAbrirCaja(false)}
              style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default OperadorDashboard
