import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import * as Icons from './shared/Icons'
import { getWhatsAppQr, getWhatsAppStatus, regenerateWhatsAppQr } from '../../services/api'

// Intervalo de auto-refresh mientras no está conectado (15 segundos)
const POLL_INTERVAL_MS = 15_000

function Card({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {icon}
        {title}
      </h3>
      {children}
    </div>
  )
}

function AdminWhatsApp() {
  const { user } = useAuth()
  const isLogged = Boolean(user?.id || user?.email || user?.rol_id)

  const [qrSrc, setQrSrc]         = useState(null)   // data:image/png;base64,...
  const [status, setStatus]       = useState(null)   // { connected, ready, status }
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const pollRef = useRef(null)

  // ─── Carga principal ────────────────────────────────────────────────────────

  const cargar = useCallback(async (silent = false) => {
    if (!isLogged) return
    if (!silent) setLoading(true)
    setError(null)

    try {
      const [qrRes, stRes] = await Promise.all([
        getWhatsAppQr().catch(() => null),
        getWhatsAppStatus().catch(() => null),
      ])

      // El backend devuelve: { success: true, data: { qr: "data:image/png;base64,..." } }
      // Axios wrappea en .data, entonces: res.data.data.qr
      const qrData  = qrRes?.data?.data?.qr  ?? null
      const stData  = stRes?.data?.data       ?? null

      setQrSrc(qrData)
      setStatus(stData)
      setLastUpdate(new Date())
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Error al cargar WhatsApp')
    } finally {
      setLoading(false)
    }
  }, [isLogged])

  // ─── Polling automático mientras no está conectado ──────────────────────────

  useEffect(() => {
    if (!isLogged) return

    cargar()

    return () => {}
  }, [isLogged, cargar])

  useEffect(() => {
    // Limpiar intervalo anterior
    if (pollRef.current) clearInterval(pollRef.current)

    const connected = Boolean(status?.ready || status?.status === 'CONNECTED')

    if (!connected && isLogged) {
      // Mientras no está conectado, refrescar cada 15s para mostrar el QR tan pronto aparezca
      pollRef.current = setInterval(() => cargar(true), POLL_INTERVAL_MS)
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [status, isLogged, cargar])

  // ─── Regenerar QR ──────────────────────────────────────────────────────────

  async function handleRegenerate() {
    setRefreshing(true)
    setQrSrc(null)
    setError(null)
    try {
      await regenerateWhatsAppQr()

      // El backend mata Chromium y lo reinicia en background.
      // Chromium puede tardar 10-25 segundos en generar el nuevo QR.
      // Hacemos polling cada 3 segundos hasta obtenerlo (máx 40 intentos = ~2 min).
      let attempts = 0
      const maxAttempts = 40
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 3000))
        attempts++
        try {
          const qrRes = await getWhatsAppQr().catch(() => null)
          const qr = qrRes?.data?.data?.qr ?? null
          if (qr) {
            // QR disponible — actualizar toda la info y salir del loop
            await cargar(true)
            return
          }
        } catch { /* reintentar */ }
      }
      // Agotamos intentos — mostrar mensaje
      setError('El QR tardó demasiado. Recarga la página o intenta de nuevo.')
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'No se pudo regenerar el QR')
    } finally {
      setRefreshing(false)
    }
  }

  // ─── Estado de conexión ─────────────────────────────────────────────────────

  // `status.connected` = true en cuanto existe el proceso cliente (incluso mientras muestra QR).
  // `status.ready` = true SOLO cuando el usuario escanea y WhatsApp confirma la sesión.
  // Usamos SOLO ready/status para no mostrar "Conectado" durante la fase de QR.
  const connected = Boolean(status?.ready || status?.status === 'CONNECTED')

  const statusColor = connected
    ? { bg: '#e8f5e9', fg: '#2E7D32' }
    : qrSrc
      ? { bg: '#fff8e1', fg: '#f57f17' }   // QR visible → esperando escaneo
      : { bg: '#fce4ec', fg: '#c62828' }   // Sin QR → desconectado

  const statusLabel = connected
    ? '✅ Conectado'
    : qrSrc
      ? '⏳ Esperando escaneo'
      : '🔴 Desconectado'

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!isLogged) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card title="WhatsApp (QR)" icon={<Icons.MessageCircle size={20} color="var(--accent)" />}>
          <p style={{ color: 'var(--subtle)' }}>Inicia sesión para administrar la conexión de WhatsApp.</p>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card title="WhatsApp (QR)" icon={<Icons.MessageCircle size={20} color="var(--accent)" />}>
        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>

          {/* ── Imagen QR ── */}
          <div style={{ flex: '0 0 auto' }}>
            <div style={{
              width: '260px',
              background: 'var(--secondary)',
              borderRadius: '16px',
              padding: '1rem',
              border: '1px solid var(--border)',
            }}>
              {/* Badge de estado */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-fg)' }}>Estado</span>
                <span style={{
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: statusColor.bg,
                  color: statusColor.fg,
                }}>
                  {statusLabel}
                </span>
              </div>

              {/* QR o placeholder */}
              {loading || refreshing ? (
                <div style={{
                  width: '100%', aspectRatio: '1',
                  background: '#f0f0f0', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '0.75rem', color: 'var(--subtle)', fontSize: '0.82rem',
                  padding: '1rem', textAlign: 'center',
                }}>
                  <span style={{ fontSize: '1.75rem', animation: 'spin 1.2s linear infinite' }}>⏳</span>
                  {refreshing
                    ? <>
                        <span style={{ fontWeight: 600, color: '#374151' }}>Reiniciando WhatsApp…</span>
                        <span>Esto puede tardar hasta 30 segundos mientras se genera el nuevo código QR.</span>
                      </>
                    : 'Cargando…'
                  }
                </div>
              ) : connected ? (
                <div style={{
                  width: '100%', aspectRatio: '1',
                  background: '#e8f5e9', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '3rem' }}>✅</span>
                  <span style={{ fontSize: '0.85rem', color: '#2E7D32', fontWeight: 600 }}>WhatsApp conectado</span>
                </div>
              ) : qrSrc ? (
                <img
                  src={qrSrc}
                  alt="QR de WhatsApp"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px' }}
                />
              ) : (
                <div style={{
                  width: '100%', aspectRatio: '1',
                  background: '#fce4ec', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '2rem' }}>📵</span>
                  <span style={{ fontSize: '0.8rem', color: '#c62828', textAlign: 'center' }}>Sin QR disponible.<br/>Usa "Regenerar QR"</span>
                </div>
              )}

              {/* Última actualización */}
              {lastUpdate && !loading && (
                <p style={{ fontSize: '0.7rem', color: 'var(--subtle)', marginTop: '0.5rem', marginBottom: 0, textAlign: 'center' }}>
                  Act. {lastUpdate.toLocaleTimeString('es-SV')}
                  {!connected && ' · Auto-refresh 15s'}
                </p>
              )}
            </div>
          </div>

          {/* ── Instrucciones y botones ── */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border)' }}>
              <p style={{ marginTop: 0, marginBottom: '0.75rem', color: 'var(--muted-fg)', fontWeight: 600 }}>
                ¿Cómo conectar?
              </p>
              <ol style={{ margin: '0 0 1.25rem', paddingLeft: '1.2rem', color: 'var(--muted-fg)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                <li>Abre <strong>WhatsApp</strong> en tu teléfono.</li>
                <li>Ve a <strong>Dispositivos vinculados</strong>.</li>
                <li>Selecciona <strong>"Vincular un dispositivo"</strong>.</li>
                <li>Escanea el QR que aparece a la izquierda.</li>
              </ol>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleRegenerate}
                  disabled={refreshing || connected || loading}
                  style={{
                    padding: '0.65rem 1.1rem',
                    background: (refreshing || connected || loading) ? '#e5e7eb' : 'var(--accent)',
                    color: (refreshing || connected || loading) ? '#9ca3af' : '#fff',
                    border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem',
                    cursor: (refreshing || connected || loading) ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {refreshing ? '⏳ Generando...' : connected ? '✅ Ya conectado' : '🔄 Regenerar QR'}
                </button>

                <button
                  onClick={() => cargar(false)}
                  disabled={loading || refreshing}
                  style={{
                    padding: '0.65rem 1.1rem',
                    background: '#fff',
                    color: '#374151',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    fontWeight: 700, fontSize: '0.875rem',
                    cursor: (loading || refreshing) ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  🔃 Actualizar
                </button>
              </div>

              <p style={{ marginTop: '1rem', marginBottom: 0, color: 'var(--subtle)', fontSize: '0.8rem' }}>
                {connected
                  ? 'WhatsApp está activo. El bot responderá mensajes automáticamente.'
                  : 'El QR se refresca automáticamente cada 15 segundos. Si expiró, usa "Regenerar QR".'}
              </p>
            </div>
          </div>

        </div>
      </Card>
    </div>
  )
}

export default AdminWhatsApp
