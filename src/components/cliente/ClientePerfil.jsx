import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPerfilMe, updatePerfil } from '../../services/api'

const ACCENT = '#e8781a'

export default function ClientePerfil() {
  const { user, logout } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm]     = useState({ nombre: '', telefono: '', direccion: '' })
  const [pwForm, setPwForm] = useState({ password_actual: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState(null)

  useEffect(() => {
    getPerfilMe()
      .then(r => {
        const d = r.data?.data || r.data
        setPerfil(d)
        setForm({
          nombre:    d?.nombre     || user?.nombre || '',
          telefono:  d?.cliente?.telefono || '',
          direccion: d?.cliente?.direccion || '',
        })
      })
      .catch(() => {
        setForm({ nombre: user?.nombre || '', telefono: '', direccion: '' })
      })
  }, [user])

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
      setMsg({ type: 'ok', text: 'Perfil actualizado correctamente' })
      setEditing(false)
      setPwForm({ password_actual: '', password: '' })
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error al guardar' })
    } finally { setSaving(false) }
  }

  const info = perfil?.cliente || {}
  const nombre = perfil?.nombre || user?.nombre || '—'
  const email  = perfil?.email  || user?.email  || '—'

  return (
    <div style={{ maxWidth: '520px' }}>
      {msg && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', background: msg.type === 'ok' ? '#e8f5e9' : '#ffebee', color: msg.type === 'ok' ? '#2e7d32' : '#c62828' }}>
          {msg.text}
        </div>
      )}

      {/* Cabecera */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{nombre}</p>
            <p style={{ fontSize: '0.85rem', color: '#888', margin: '0.2rem 0 0' }}>{email}</p>
          </div>
        </div>

        {/* Datos de solo lectura */}
        {!editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Nombre',    value: nombre },
              { label: 'Correo',    value: email },
              { label: 'Teléfono',  value: info.telefono  || '—' },
              { label: 'Dirección', value: info.direccion || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.875rem', background: '#f8f9fb', borderRadius: '8px', fontSize: '0.875rem' }}>
                <span style={{ color: '#888', fontWeight: 500 }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
            <button onClick={() => { setEditing(true); setMsg(null) }}
              style={{ marginTop: '0.5rem', padding: '0.7rem', border: `1.5px solid ${ACCENT}`, borderRadius: '8px', background: 'transparent', color: ACCENT, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
              Editar perfil
            </button>
          </div>
        )}

        {/* Formulario edición */}
        {editing && (
          <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Nombre', key: 'nombre', type: 'text' },
              { label: 'Teléfono WhatsApp', key: 'telefono', type: 'tel' },
              { label: 'Dirección', key: 'direccion', type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '0.25rem' }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #dde', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}

            <div style={{ background: '#f8f9fb', borderRadius: '8px', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', margin: 0 }}>Cambiar contraseña <span style={{ fontWeight: 400, color: '#aaa' }}>(opcional)</span></p>
              {[
                { label: 'Contraseña actual', key: 'password_actual' },
                { label: 'Nueva contraseña', key: 'password' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ fontSize: '0.75rem', color: '#777', display: 'block', marginBottom: '0.2rem' }}>{label}</label>
                  <input type="password" value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #dde', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving}
                style={{ flex: 1, padding: '0.7rem', background: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                style={{ flex: 1, padding: '0.7rem', border: '1.5px solid #dde', borderRadius: '8px', background: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <button onClick={logout}
        style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #ffccbc', borderRadius: '8px', background: '#fff3e0', color: ACCENT, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
        Cerrar sesión
      </button>
    </div>
  )
}
