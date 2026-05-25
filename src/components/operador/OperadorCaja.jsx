import { useState, useEffect } from 'react'
import { getEstadoCaja, getHistorialCaja, abrirCaja, cerrarCaja } from '../../services/api'
import { toArr } from '../../utils/parseResponse'
import Modal from '../admin/shared/Modal'
import * as Icons from '../admin/shared/Icons'

/* ── helpers ───────────────────────────────────────────────── */
function fmt(n) { return `$${parseFloat(n || 0).toFixed(2)}` }
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function duration(open, close) {
  const ms = new Date(close || new Date()) - new Date(open)
  const h  = Math.floor(ms / 3600000)
  const m  = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}m`
}

/* ── Sub-components ─────────────────────────────────────────── */

function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', ...style,
    }}>
      {children}
    </div>
  )
}

function InfoRow({ label, value, bold, accent }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.6rem 0.875rem', background: '#f8fafc', borderRadius: '8px',
      fontSize: '0.875rem',
    }}>
      <span style={{ color: '#9ca3af', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 600, color: accent ? 'var(--accent)' : '#111827' }}>{value}</span>
    </div>
  )
}

function FormField({ label, type = 'text', value, onChange, placeholder, note, autoFocus }) {
  return (
    <div>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus}
        style={{
          width: '100%', padding: '0.65rem 0.875rem',
          border: '1.5px solid #e5e7eb', borderRadius: '8px',
          fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
          fontFamily: 'var(--font-body)', transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)' }}
        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
      />
      {note && <p style={{ fontSize: '0.73rem', color: '#9ca3af', margin: '0.3rem 0 0' }}>{note}</p>}
    </div>
  )
}

function EstadoBadge({ estado }) {
  const open = estado === 'ABIERTA'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
      background: open ? '#ecfdf5' : '#f9fafb',
      color: open ? '#059669' : '#6b7280',
    }}>
      {open ? <Icons.CheckCircle size={12} /> : <Icons.Lock size={12} />}
      {open ? 'Abierta' : 'Cerrada'}
    </span>
  )
}

/* ── Main component ─────────────────────────────────────────── */

export default function OperadorCaja() {
  const [caja, setCaja]         = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)

  // Modales
  const [showAbrir, setShowAbrir]   = useState(false)
  const [showCerrar, setShowCerrar] = useState(false)
  const [montoApertura, setMontoApertura] = useState('')
  const [formError, setFormError]         = useState(null)

  function cargar() {
    setLoading(true); setError(null)
    Promise.all([
      getEstadoCaja().catch(() => ({ data: null })),
      getHistorialCaja().catch(() => ({ data: [] })),
    ]).then(([eRes, hRes]) => {
      // ⚠️ Use the explicit `abierta` flag — NEVER fall back to historial search,
      // because an admin operator would see ALL users' cajas and could accidentally
      // pick up another user's open caja, causing "No hay caja abierta" on close.
      const cajaData = eRes.data?.data ?? null
      const isOpen   = eRes.data?.abierta === true
      setCaja(isOpen && cajaData ? cajaData : null)
      setHistorial(toArr(hRes.data))
    })
    .catch(() => setError('No se pudo cargar el estado de caja.'))
    .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  async function handleAbrir() {
    if (!montoApertura || parseFloat(montoApertura) < 0) {
      setFormError('Ingresa un monto de apertura válido'); return
    }
    setSaving(true); setFormError(null)
    try {
      await abrirCaja({ monto_inicial: parseFloat(montoApertura) })
      setMontoApertura(''); setShowAbrir(false)
      cargar()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al abrir caja')
    } finally { setSaving(false) }
  }

  async function handleCerrar() {
    setSaving(true); setFormError(null)
    try {
      await cerrarCaja({})
      setCaja(null); setShowCerrar(false)
      cargar()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al cerrar caja')
    } finally { setSaving(false) }
  }

  const abierta = caja?.estado === 'ABIERTA'

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ height: '120px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
      <div style={{ height: '220px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <Card>
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <Icons.AlertTriangle size={40} color="#f87171" style={{ margin: '0 auto 1rem' }} />
        <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>{error}</p>
        <button onClick={cargar} style={{ padding: '0.6rem 1.25rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          Reintentar
        </button>
      </div>
    </Card>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>

      {/* ── Estado actual ── */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: abierta ? '#dcfce7' : '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icons.Wallet size={22} color={abierta ? '#16a34a' : '#9ca3af'} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                Mi caja
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0.1rem 0 0' }}>Estado del turno actual</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <EstadoBadge estado={abierta ? 'ABIERTA' : 'CERRADA'} />
            {abierta
              ? (
                <button
                  onClick={() => { setShowCerrar(true); setFormError(null) }}
                  style={{
                    padding: '0.6rem 1.1rem', background: '#fef2f2',
                    color: '#dc2626', border: '1.5px solid #fecaca',
                    borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                    fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2' }}
                >
                  <Icons.Lock size={13} /> Cerrar caja
                </button>
              )
              : (
                <button
                  onClick={() => { setShowAbrir(true); setFormError(null) }}
                  style={{
                    padding: '0.6rem 1.25rem', background: 'var(--accent)',
                    color: '#fff', border: 'none', borderRadius: '8px',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  <Icons.Wallet size={15} /> Abrir caja
                </button>
              )
            }
          </div>
        </div>

        {/* Datos de la caja actual */}
        {abierta
          ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <InfoRow label="Apertura"      value={fmtDate(caja.fecha_apertura)} />
              <InfoRow label="Monto inicial" value={fmt(caja.monto_inicial)} bold />
              <InfoRow label="Duración"      value={duration(caja.fecha_apertura)} />
              {caja.id && <InfoRow label="ID de caja"   value={`#${caja.id}`} />}
            </div>
          )
          : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9ca3af' }}>
              <Icons.Lock size={28} color="#e5e7eb" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.875rem', margin: 0 }}>No tienes una caja abierta. Inicia tu turno abriendo la caja.</p>
            </div>
          )
        }
      </Card>

      {/* ── Historial ── */}
      <Card>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700,
          margin: '0 0 1.25rem', color: '#111827',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <Icons.ClipboardList size={16} color="var(--accent)" /> Mis turnos anteriores
        </h3>

        {historial.length === 0
          ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }}>
              <Icons.ClipboardList size={32} color="#e5e7eb" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.875rem', margin: 0 }}>Sin historial de cajas</p>
            </div>
          )
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    {['#', 'Apertura', 'Cierre', 'M. Inicial', 'M. Final', 'Duración', 'Estado'].map(h => (
                      <th key={h} style={{
                        padding: '0.5rem 0.75rem', textAlign: 'left',
                        fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historial.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f9fafb' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fafafa' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{ padding: '0.75rem', fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>#{c.id}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.78rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtDate(c.fecha_apertura)}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.78rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {c.fecha_cierre ? fmtDate(c.fecha_cierre) : <span style={{ color: '#16a34a', fontWeight: 600 }}>Activa</span>}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{fmt(c.monto_inicial)}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, color: c.monto_final ? 'var(--accent)' : '#9ca3af' }}>
                        {c.monto_final ? fmt(c.monto_final) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.78rem', color: '#6b7280' }}>
                        {c.fecha_apertura ? duration(c.fecha_apertura, c.fecha_cierre) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <EstadoBadge estado={c.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Card>

      {/* ── Modal Abrir Caja ── */}
      {showAbrir && (
        <Modal onClose={() => { setShowAbrir(false); setFormError(null); setMontoApertura('') }} maxWidth="400px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.Wallet size={20} color="var(--accent)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Abrir caja</h3>
          </div>

          {formError && (
            <div style={{ padding: '0.65rem 0.875rem', borderRadius: '8px', marginBottom: '1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Icons.AlertTriangle size={13} /> {formError}
            </div>
          )}

          <FormField
            label="Monto de apertura *"
            type="number"
            value={montoApertura}
            onChange={e => setMontoApertura(e.target.value)}
            placeholder="0.00"
            note="Introduce el efectivo con el que inicias el turno."
            autoFocus
          />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              onClick={handleAbrir}
              disabled={saving || !montoApertura}
              style={{
                flex: 1, padding: '0.75rem',
                background: saving || !montoApertura ? '#f3f4f6' : 'var(--accent)',
                color: saving || !montoApertura ? '#9ca3af' : '#fff',
                border: 'none', borderRadius: '8px', fontWeight: 700,
                cursor: saving || !montoApertura ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              }}
            >
              {saving ? '⏳ Abriendo...' : <><Icons.Wallet size={15} /> Abrir caja</>}
            </button>
            <button
              onClick={() => { setShowAbrir(false); setFormError(null); setMontoApertura('') }}
              style={{ flex: 1, padding: '0.75rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal Cerrar Caja ── */}
      {showCerrar && (
        <Modal onClose={() => { setShowCerrar(false); setFormError(null) }} maxWidth="420px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.Lock size={20} color="#dc2626" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Cerrar caja</h3>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0.1rem 0 0' }}>Esta acción cerrará tu turno actual</p>
            </div>
          </div>

          {/* Resumen de la caja a cerrar */}
          {caja && (
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <InfoRow label="Apertura"      value={fmtDate(caja.fecha_apertura)} />
              <InfoRow label="Monto inicial" value={fmt(caja.monto_inicial)} bold />
              <InfoRow label="Duración"      value={duration(caja.fecha_apertura)} />
            </div>
          )}

          {/* Nota monto final automático */}
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
            padding: '0.75rem 1rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: '#1e40af',
          }}>
            <Icons.DollarSign size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span>
              El <strong>monto final</strong> se calcula automáticamente a partir de los movimientos registrados
              en esta caja (ingresos y egresos del turno).
            </span>
          </div>

          {formError && (
            <div style={{ padding: '0.65rem 0.875rem', borderRadius: '8px', marginBottom: '1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Icons.AlertTriangle size={13} /> {formError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleCerrar}
              disabled={saving}
              style={{
                flex: 1, padding: '0.75rem',
                background: saving ? '#f3f4f6' : '#dc2626',
                color: saving ? '#9ca3af' : '#fff',
                border: 'none', borderRadius: '8px', fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              }}
            >
              {saving ? '⏳ Cerrando...' : <><Icons.Lock size={15} /> Confirmar cierre</>}
            </button>
            <button
              onClick={() => { setShowCerrar(false); setFormError(null) }}
              style={{ flex: 1, padding: '0.75rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontWeight: 600, cursor: 'pointer', color: '#374151' }}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
