import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPerfilMe, updatePerfil } from '../../services/api'
import * as Icons from '../admin/shared/Icons'

function Card({ title, icon: Icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
      {title && (
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700,
          margin: '0 0 1.25rem', color: '#111827',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {Icon && <Icon size={17} color="var(--accent)" />}
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

function FieldRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.6rem 0.875rem', background: '#f8fafc', borderRadius: '8px',
      fontSize: '0.875rem',
    }}>
      <span style={{ color: '#9ca3af', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#111827' }}>{value || '—'}</span>
    </div>
  )
}

function FormField({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '0.65rem 0.875rem',
          border: '1.5px solid #e5e7eb', borderRadius: '8px',
          fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
          fontFamily: 'var(--font-body)', transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)' }}
        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

export default function ClientePerfil() {
  const { user, logout } = useAuth()
  const [perfil, setPerfil]   = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ nombre: '', telefono: '', direccion: '' })
  const [pwForm, setPwForm]   = useState({ password_actual: '', password: '' })
  const [saving, setSaving]   = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [msg, setMsg]         = useState(null)

  function cargarPerfil() {
    setLoadError(null)
    getPerfilMe()
      .then(r => {
        const d = r.data?.data || r.data
        setPerfil(d)
        setForm({
          nombre:    d?.nombre              || user?.nombre || '',
          telefono:  d?.cliente?.telefono   || '',
          direccion: d?.cliente?.direccion  || '',
        })
      })
      .catch(() => {
        setLoadError('No se pudo cargar tu perfil. Intenta de nuevo.')
        setForm({ nombre: user?.nombre || '', telefono: '', direccion: '' })
      })
  }

  useEffect(() => { cargarPerfil() }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGuardar(e) {
    e.preventDefault()
    setSaving(true); setMsg(null)
    try {
      const payload = {
        nombre:    form.nombre.trim()    || undefined,
        telefono:  form.telefono.trim()  || undefined,
        direccion: form.direccion.trim() || undefined,
        ...(pwForm.password ? { password: pwForm.password, password_actual: pwForm.password_actual } : {}),
      }
      await updatePerfil(payload)

      // ── FIX: re-fetch perfil para reflejar los datos guardados ──
      const refreshed = await getPerfilMe()
      const d = refreshed.data?.data || refreshed.data
      setPerfil(d)
      setForm({
        nombre:    d?.nombre             || '',
        telefono:  d?.cliente?.telefono  || '',
        direccion: d?.cliente?.direccion || '',
      })

      setMsg({ type: 'ok', text: '✅ Perfil actualizado correctamente' })
      setEditing(false)
      setPwForm({ password_actual: '', password: '' })
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error al guardar los cambios' })
    } finally {
      setSaving(false)
    }
  }

  const info   = perfil?.cliente || {}
  const nombre = perfil?.nombre  || user?.nombre || '—'
  const email  = perfil?.email   || user?.email  || '—'

  return (
    <div style={{ maxWidth: '560px' }}>

      {/* Mensaje de feedback */}
      {msg && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem',
          background: msg.type === 'ok' ? '#f0fdf4' : '#fef2f2',
          color:      msg.type === 'ok' ? '#166534'  : '#dc2626',
          border:     `1px solid ${msg.type === 'ok' ? '#bbf7d0' : '#fecaca'}`,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {msg.type === 'ok' ? <Icons.CheckCircle size={15} /> : <Icons.AlertTriangle size={15} />}
          {msg.text}
        </div>
      )}

      {/* Error de carga */}
      {loadError && (
        <div style={{
          padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1rem',
          background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <Icons.AlertTriangle size={15} /> {loadError}
          </div>
          <button onClick={cargarPerfil} style={{ background: 'none', border: '1px solid #dc2626', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* ── Avatar + cabecera ── */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: editing ? '1.5rem' : '1rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, flexShrink: 0,
          }}>
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>{nombre}</p>
            <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '0.15rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Icons.Lock size={11} /> {email}
            </p>
          </div>
        </div>

        {/* Vista lectura */}
        {!editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <FieldRow label="Nombre"    value={nombre} />
            <FieldRow label="Correo"    value={email} />
            <FieldRow label="Teléfono WhatsApp" value={info.telefono} />
            <FieldRow label="Dirección" value={info.direccion} />

            <button
              onClick={() => { setEditing(true); setMsg(null) }}
              style={{
                marginTop: '0.75rem', padding: '0.65rem',
                border: '1.5px solid var(--accent)',
                borderRadius: '8px', background: 'transparent', color: 'var(--accent)',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,53,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <Icons.Edit size={14} /> Editar perfil
            </button>
          </div>
        )}

        {/* Formulario edición */}
        {editing && (
          <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <FormField
              label="Nombre"
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Tu nombre"
            />
            <FormField
              label="Teléfono WhatsApp (con código de país)"
              type="tel"
              value={form.telefono}
              onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
              placeholder="50372880187"
            />
            <FormField
              label="Dirección de entrega"
              value={form.direccion}
              onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
              placeholder="Col. Escalón, 5a calle pte #123..."
            />

            {/* Cambio de contraseña */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Icons.Lock size={13} color="var(--accent)" />
                Cambiar contraseña <span style={{ fontWeight: 400, color: '#9ca3af' }}>(opcional)</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <FormField
                  label="Contraseña actual"
                  type="password"
                  value={pwForm.password_actual}
                  onChange={e => setPwForm(p => ({ ...p, password_actual: e.target.value }))}
                />
                <FormField
                  label="Nueva contraseña"
                  type="password"
                  value={pwForm.password}
                  onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1, padding: '0.7rem',
                  background: saving ? '#f3f4f6' : 'var(--accent)',
                  color: saving ? '#9ca3af' : '#fff',
                  border: 'none', borderRadius: '8px',
                  fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
              >
                {saving ? '⏳ Guardando...' : <><Icons.CheckCircle size={14} /> Guardar cambios</>}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setMsg(null) }}
                style={{
                  flex: 1, padding: '0.7rem',
                  border: '1.5px solid #e5e7eb', borderRadius: '8px',
                  background: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', color: '#374151',
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Card>

      {/* Cerrar sesión */}
      <button
        onClick={logout}
        style={{
          width: '100%', padding: '0.75rem',
          border: '1.5px solid #fecaca', borderRadius: '8px',
          background: '#fef2f2', color: '#dc2626',
          fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2' }}
      >
        <Icons.LogOut size={15} /> Cerrar sesión
      </button>
    </div>
  )
}
