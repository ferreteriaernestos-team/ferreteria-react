import { useState, useEffect, useCallback } from 'react'
import {
  getDescuentos, createDescuento, updateDescuento, deleteDescuento, verificarPrimeraCompra
} from '../../services/api'
import { toArr } from '../../utils/parseResponse'
import Modal from './shared/Modal'
import * as Icons from './shared/Icons'

// Codigos internos para identificar los descuentos predefinidos
const CODIGO_FRECUENTE    = 'CLIENTE_FRECUENTE'
const CODIGO_EMPRESA      = 'EMPRESA'
const CODIGO_PRIMERA      = 'PRIMERA_COMPRA'

const PREDEFINED = [
  {
    codigo:      CODIGO_FRECUENTE,
    nombre:      'Cliente Frecuente',
    descripcion: 'Se aplica a clientes con historial de compras recurrentes.',
    defaultVal:  10,
    color:       '#1565C0',
    bg:          '#e3f2fd',
    icon:        'Users',
  },
  {
    codigo:      CODIGO_EMPRESA,
    nombre:      'Empresa',
    descripcion: 'Descuento especial para clientes corporativos.',
    defaultVal:  15,
    color:       '#6a1b9a',
    bg:          '#f3e5f5',
    icon:        'Package',
  },
  {
    codigo:      CODIGO_PRIMERA,
    nombre:      'Primera Compra',
    descripcion: 'Solo aplicable en el primer pedido del cliente.',
    defaultVal:  10,
    color:       '#2E7D32',
    bg:          '#e8f5e9',
    icon:        'Tag',
    oneUse:      true,
  },
]

function AdminDescuentos() {
  const [predefinedMap, setPredefinedMap] = useState({})    // codigo → discount object | null
  const [custom, setCustom]               = useState([])    // custom discounts (no special codigo)
  const [loading, setLoading]             = useState(true)

  // Edit predefined modal
  const [editPred, setEditPred]           = useState(null)  // { def, discount }
  const [editVal, setEditVal]             = useState('')
  const [savingPred, setSavingPred]       = useState(false)

  // Custom discount form
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customForm, setCustomForm]         = useState({ nombre: '', valor: '', descripcion: '' })
  const [editCustom, setEditCustom]         = useState(null)
  const [savingCustom, setSavingCustom]     = useState(false)
  const [customError, setCustomError]       = useState(null)

  // Primera compra verify
  const [verifyOpen, setVerifyOpen]         = useState(false)
  const [verifyId, setVerifyId]             = useState('')
  const [verifyResult, setVerifyResult]     = useState(null)
  const [verifying, setVerifying]           = useState(false)

  const cargar = useCallback(() => {
    setLoading(true)
    getDescuentos({ limit: 200 })
      .then(r => {
        const all = toArr(r.data)
        const map = {}
        PREDEFINED.forEach(def => {
          map[def.codigo] = all.find(d => d.codigo === def.codigo) || null
        })
        setPredefinedMap(map)
        setCustom(all.filter(d => !PREDEFINED.some(def => def.codigo === d.codigo)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // ── Predefined helpers ────────────────────────────────────────────────────

  async function handleTogglePredefined(def, discount) {
    if (!discount) {
      // Create it with default value
      try {
        const { data } = await createDescuento({
          nombre:      def.nombre,
          tipo:        'PORCENTAJE',
          valor:       def.defaultVal,
          codigo:      def.codigo,
          descripcion: def.descripcion,
        })
        setPredefinedMap(prev => ({ ...prev, [def.codigo]: data?.data || data }))
      } catch { alert('No se pudo crear el descuento') }
      return
    }
    try {
      const { data } = await updateDescuento(discount.id, { activo: !discount.activo })
      setPredefinedMap(prev => ({ ...prev, [def.codigo]: data?.data || data }))
    } catch { alert('No se pudo actualizar') }
  }

  function openEditPred(def, discount) {
    setEditPred({ def, discount })
    setEditVal(discount ? String(parseFloat(discount.valor)) : String(def.defaultVal))
  }

  async function handleSavePred() {
    const val = parseFloat(editVal)
    if (!val || val <= 0 || val > 100) return alert('El porcentaje debe estar entre 1 y 100')
    setSavingPred(true)
    try {
      const { def, discount } = editPred
      if (discount) {
        const { data } = await updateDescuento(discount.id, { valor: val })
        setPredefinedMap(prev => ({ ...prev, [def.codigo]: data?.data || data }))
      } else {
        const { data } = await createDescuento({
          nombre:      def.nombre,
          tipo:        'PORCENTAJE',
          valor:       val,
          codigo:      def.codigo,
          descripcion: def.descripcion,
        })
        setPredefinedMap(prev => ({ ...prev, [def.codigo]: data?.data || data }))
      }
      setEditPred(null)
    } catch { alert('No se pudo guardar') }
    finally { setSavingPred(false) }
  }

  // ── Primera compra verify ─────────────────────────────────────────────────

  async function handleVerificar() {
    const id = parseInt(verifyId)
    if (!id || isNaN(id)) return alert('Ingresa un ID de cliente válido')
    setVerifying(true); setVerifyResult(null)
    try {
      const { data } = await verificarPrimeraCompra(id)
      setVerifyResult(data?.data || data)
    } catch { alert('Error al verificar') }
    finally { setVerifying(false) }
  }

  // ── Custom discounts ──────────────────────────────────────────────────────

  function openCustomEdit(d) {
    setEditCustom(d)
    setCustomForm({ nombre: d.nombre, valor: String(parseFloat(d.valor)), descripcion: d.descripcion || '' })
    setCustomError(null)
    setShowCustomForm(true)
  }

  async function handleSaveCustom() {
    if (!customForm.nombre.trim() || !customForm.valor) return setCustomError('Nombre y porcentaje son requeridos')
    const val = parseFloat(customForm.valor)
    if (!val || val <= 0 || val > 100) return setCustomError('El porcentaje debe estar entre 1 y 100')
    setSavingCustom(true); setCustomError(null)
    try {
      const payload = { nombre: customForm.nombre, tipo: 'PORCENTAJE', valor: val, descripcion: customForm.descripcion || undefined }
      if (editCustom) {
        const { data } = await updateDescuento(editCustom.id, payload)
        setCustom(prev => prev.map(d => d.id === editCustom.id ? (data?.data || data) : d))
      } else {
        const { data } = await createDescuento(payload)
        setCustom(prev => [data?.data || data, ...prev])
      }
      setShowCustomForm(false); setEditCustom(null); setCustomForm({ nombre: '', valor: '', descripcion: '' })
    } catch (err) {
      setCustomError(err.response?.data?.message || 'Error al guardar')
    } finally { setSavingCustom(false) }
  }

  async function handleDeleteCustom(id) {
    if (!confirm('¿Desactivar este descuento?')) return
    try {
      await deleteDescuento(id)
      setCustom(prev => prev.map(d => d.id === id ? { ...d, activo: false } : d))
    } catch { alert('No se pudo desactivar') }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Section: predefined */}
      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
        Descuentos predefinidos
      </h3>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: '160px', borderRadius: '12px', background: '#f0f0f0' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {PREDEFINED.map(def => {
            const discount = predefinedMap[def.codigo]
            const isActive = discount?.activo === true
            const valor    = discount ? parseFloat(discount.valor) : def.defaultVal
            const IconComp = Icons[def.icon]
            return (
              <div key={def.codigo} style={{
                background: '#fff',
                borderRadius: '14px',
                border: `2px solid ${isActive ? def.bg : 'var(--border)'}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                opacity: !discount ? 0.85 : 1,
              }}>
                {/* Card header */}
                <div style={{ background: isActive ? def.bg : '#f5f5f5', padding: '1.1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: isActive ? def.color : '#bbb', color: '#fff', display: 'flex' }}>
                      {IconComp && <IconComp size={18} color="#fff" />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: isActive ? def.color : '#888' }}>{def.nombre}</p>
                      {def.oneUse && <p style={{ fontSize: '0.68rem', color: isActive ? def.color : '#aaa', fontWeight: 600 }}>1 uso por cliente</p>}
                    </div>
                  </div>
                  {/* Toggle */}
                  <div onClick={() => handleTogglePredefined(def, discount)} style={{ cursor: 'pointer', width: '42px', height: '24px', borderRadius: '12px', background: isActive ? def.color : '#ccc', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: '3px', left: isActive ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--subtle)', marginBottom: '0.875rem', lineHeight: 1.4 }}>{def.descripcion}</p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--subtle)', marginBottom: '0.1rem' }}>Descuento actual</p>
                      <p style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: isActive ? def.color : '#bbb' }}>{valor}%</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <button onClick={() => openEditPred(def, discount)}
                        style={{ padding: '0.4rem 0.875rem', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${def.color}`, color: def.color, background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Icons.Edit size={12} /> Editar %
                      </button>
                      {def.oneUse && (
                        <button onClick={() => { setVerifyOpen(true); setVerifyResult(null); setVerifyId('') }}
                          style={{ padding: '0.4rem 0.875rem', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--border)', color: 'var(--muted-fg)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Icons.Search size={12} /> Verificar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Section: custom discounts */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Descuentos personalizados
        </h3>
        <button onClick={() => { setShowCustomForm(true); setEditCustom(null); setCustomForm({ nombre: '', valor: '', descripcion: '' }); setCustomError(null) }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.55rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Icons.Plus size={14} /> Nuevo
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        {loading ? (
          <p style={{ padding: '2rem', color: 'var(--subtle)' }}>Cargando...</p>
        ) : custom.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--subtle)' }}>
            <Icons.Percent size={40} color="#ddd" />
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Sin descuentos personalizados</p>
            <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Crea un descuento con el porcentaje que necesites</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--secondary)' }}>
                {['Nombre', 'Descripción', 'Descuento', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted-fg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {custom.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border)', opacity: d.activo ? 1 : 0.5 }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{d.nombre}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--subtle)', maxWidth: '200px' }}>{d.descripcion || '–'}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)', color: d.activo ? 'var(--accent)' : '#bbb' }}>
                      {d.tipo === 'PORCENTAJE' ? `${parseFloat(d.valor)}%` : `$${parseFloat(d.valor).toFixed(2)}`}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: d.activo ? '#e8f5e9' : '#f5f5f5', color: d.activo ? '#2E7D32' : '#888' }}>
                      {d.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openCustomEdit(d)}
                        style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Icons.Edit size={12} /> Editar
                      </button>
                      {d.activo && (
                        <button onClick={() => handleDeleteCustom(d.id)}
                          style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid #c62828', color: '#c62828', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Icons.Trash2 size={12} /> Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: edit predefined % */}
      {editPred && (
        <Modal onClose={() => setEditPred(null)} maxWidth="380px">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.4rem' }}>
            Editar porcentaje
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--subtle)', marginBottom: '1.5rem' }}>
            {editPred.def.nombre}
          </p>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Porcentaje de descuento *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                min="1" max="100" step="0.5" autoFocus
                style={{ flex: 1, padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--muted-fg)' }}>%</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={handleSavePred} disabled={savingPred}
              style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              {savingPred ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setEditPred(null)}
              style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: verify primera compra */}
      {verifyOpen && (
        <Modal onClose={() => { setVerifyOpen(false); setVerifyResult(null) }} maxWidth="400px">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.4rem' }}>Verificar elegibilidad</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--subtle)', marginBottom: '1.5rem' }}>Comprueba si un cliente puede aplicar el descuento de primera compra.</p>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>ID del cliente</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number" placeholder="Ej: 12" value={verifyId}
                onChange={e => { setVerifyId(e.target.value); setVerifyResult(null) }}
                onKeyDown={e => e.key === 'Enter' && handleVerificar()}
                style={{ flex: 1, padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}
              />
              <button onClick={handleVerificar} disabled={verifying}
                style={{ padding: '0.65rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                {verifying ? '...' : 'Verificar'}
              </button>
            </div>
          </div>
          {verifyResult && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '10px', background: verifyResult.eligible ? '#e8f5e9' : '#ffebee', border: `1.5px solid ${verifyResult.eligible ? '#c8e6c9' : '#ffcdd2'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {verifyResult.eligible
                  ? <Icons.CheckCircle size={22} color="#2E7D32" />
                  : <Icons.X size={22} color="#c62828" />
                }
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: verifyResult.eligible ? '#2E7D32' : '#c62828' }}>
                    {verifyResult.eligible ? 'Elegible para primera compra' : 'No elegible'}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--subtle)', marginTop: '0.15rem' }}>
                    {verifyResult.eligible
                      ? 'El cliente no tiene pedidos previos.'
                      : `El cliente ya tiene ${verifyResult.total_pedidos} pedido(s) registrado(s).`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          <button onClick={() => { setVerifyOpen(false); setVerifyResult(null) }}
            style={{ marginTop: '1.25rem', width: '100%', background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.65rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Cerrar
          </button>
        </Modal>
      )}

      {/* Modal: create/edit custom discount */}
      {showCustomForm && (
        <Modal onClose={() => { setShowCustomForm(false); setEditCustom(null) }} maxWidth="420px">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            {editCustom ? 'Editar descuento' : 'Nuevo descuento personalizado'}
          </h3>
          {customError && <p style={{ color: '#c62828', marginBottom: '1rem', fontSize: '0.875rem', background: '#ffebee', padding: '0.6rem', borderRadius: '6px' }}>{customError}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Nombre *</label>
              <input type="text" value={customForm.nombre} onChange={e => setCustomForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Descuento empleados"
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Porcentaje (%) *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="number" value={customForm.valor} onChange={e => setCustomForm(p => ({ ...p, valor: e.target.value }))} min="1" max="100" step="0.5" placeholder="Ej: 20"
                  style={{ flex: 1, padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--muted-fg)' }}>%</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Descripción</label>
              <input type="text" value={customForm.descripcion} onChange={e => setCustomForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Opcional"
                style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={handleSaveCustom} disabled={savingCustom}
              style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              {savingCustom ? 'Guardando...' : editCustom ? 'Guardar cambios' : 'Crear descuento'}
            </button>
            <button onClick={() => { setShowCustomForm(false); setEditCustom(null) }}
              style={{ flex: 1, background: 'var(--secondary)', color: 'var(--fg)', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminDescuentos
