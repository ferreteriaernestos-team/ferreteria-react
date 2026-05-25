import { useState, useEffect } from 'react'
import Breadcrumb from '../components/ui/Breadcrumb'
import ProductCard from '../components/ui/ProductCard'
import { getDescuentos, getProductos } from '../services/api'
import { toArr } from '../utils/parseResponse'

/* ── Helpers ─────────────────────────────────────────────── */
function fmtFecha(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
function isVigente(d) {
  if (!d) return true
  return new Date(d) >= new Date()
}

/* ── Sub-components ──────────────────────────────────────── */
function DiscountSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ height: '16px', width: '40%', background: '#f3f4f6', borderRadius: '4px' }} />
      <div style={{ height: '40px', width: '60%', background: '#f3f4f6', borderRadius: '8px' }} />
      <div style={{ height: '12px', width: '80%', background: '#f3f4f6', borderRadius: '4px' }} />
      <div style={{ height: '36px', background: '#f3f4f6', borderRadius: '8px' }} />
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ height: '180px', background: '#f3f4f6' }} />
      <div style={{ padding: '1rem' }}>
        <div style={{ height: '12px', width: '45%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.4rem' }} />
        <div style={{ height: '14px', width: '80%', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.75rem' }} />
        <div style={{ height: '18px', width: '40%', background: '#f3f4f6', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        width: '100%', padding: '0.75rem', borderRadius: '10px',
        border: '2px dashed #d1d5db',
        background: copied ? '#ecfdf5' : '#f8fafc',
        color: copied ? '#16a34a' : '#374151',
        fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem',
        cursor: 'pointer', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        letterSpacing: '0.1em',
      }}
      onMouseEnter={e => { if (!copied) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#fff7ed' }}}
      onMouseLeave={e => { if (!copied) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f8fafc' }}}
    >
      {copied ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          ¡Copiado!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {text}
        </>
      )}
    </button>
  )
}

function DiscountCard({ d }) {
  const [hover, setHover] = useState(false)
  const vigente = isVigente(d.fecha_fin)
  const esPorcentaje = d.tipo === 'PORCENTAJE'

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: '16px', padding: '1.75rem',
        boxShadow: hover ? '0 8px 28px rgba(0,0,0,0.11)' : '0 2px 8px rgba(0,0,0,0.06)',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        border: vigente ? '1.5px solid #fed7aa' : '1.5px solid #e5e7eb',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Ribbon vigente */}
      {vigente && (
        <div style={{
          position: 'absolute', top: '14px', right: '-22px',
          background: 'var(--accent)', color: '#fff', fontSize: '0.65rem',
          fontWeight: 700, padding: '0.2rem 2rem', transform: 'rotate(45deg)',
          letterSpacing: '0.05em',
        }}>
          ACTIVO
        </div>
      )}

      {/* Tipo + nombre */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
          background: esPorcentaje ? '#fff7ed' : '#ecfdf5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {esPorcentaje ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
            {esPorcentaje ? 'Descuento %' : 'Descuento fijo'}
          </p>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.nombre}
          </p>
        </div>
      </div>

      {/* Valor */}
      <div style={{ textAlign: 'center', padding: '0.875rem', background: esPorcentaje ? '#fff7ed' : '#f0fdf4', borderRadius: '10px', marginBottom: '1rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, color: esPorcentaje ? 'var(--accent)' : '#16a34a', margin: 0 }}>
          {esPorcentaje ? `${parseFloat(d.valor).toFixed(0)}%` : `$${parseFloat(d.valor).toFixed(2)}`}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--subtle)', marginTop: '0.2rem' }}>de descuento</p>
      </div>

      {/* Descripción */}
      {d.descripcion && (
        <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.875rem', lineHeight: 1.5 }}>
          {d.descripcion}
        </p>
      )}

      {/* Código */}
      {d.codigo && <CopyButton text={d.codigo} />}

      {/* Vigencia */}
      {(d.fecha_inicio || d.fecha_fin) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.875rem', fontSize: '0.72rem', color: 'var(--subtle)' }}>
          {d.fecha_inicio && <span>Desde: {fmtFecha(d.fecha_inicio)}</span>}
          {d.fecha_fin && (
            <span style={{ color: vigente ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
              {vigente ? `Vence: ${fmtFecha(d.fecha_fin)}` : `Venció: ${fmtFecha(d.fecha_fin)}`}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────── */
function PromocionesPage() {
  const [descuentos, setDescuentos] = useState([])
  const [productos, setProductos]   = useState([])
  const [loadingD, setLoadingD]     = useState(true)
  const [loadingP, setLoadingP]     = useState(true)
  const [tab, setTab]               = useState('descuentos') // 'descuentos' | 'productos'

  useEffect(() => {
    // Descuentos activos
    setLoadingD(true)
    getDescuentos({ activo: true })
      .then(r => setDescuentos(toArr(r.data?.data || r.data)))
      .catch(() => setDescuentos([]))
      .finally(() => setLoadingD(false))

    // Últimos productos (para explorar)
    setLoadingP(true)
    getProductos({ limit: 16 })
      .then(r => setProductos(toArr(r.data?.data || r.data)))
      .catch(() => setProductos([]))
      .finally(() => setLoadingP(false))
  }, [])

  const activeDescuentos = descuentos.filter(d => d.activo !== false)
  const expiredDescuentos = descuentos.filter(d => d.activo === false || !isVigente(d.fecha_fin))

  return (
    <main>
      <Breadcrumb current="Promociones" />

      {/* Hero banner */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '4rem 1rem', marginBottom: 0,
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,107,53,0.2)', border: '1px solid rgba(255,107,53,0.4)',
            borderRadius: '20px', padding: '0.3rem 0.875rem', marginBottom: '1rem',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em' }}>
              OFERTAS Y DESCUENTOS
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: '0.75rem',
          }}>
            Promociones de la semana
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto' }}>
            Descuentos exclusivos en herramientas y materiales. Usa nuestros códigos al realizar tu pedido.
          </p>
        </div>
      </section>

      <section className="section section--gray">
        <div className="container">

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#fff', padding: '0.35rem', borderRadius: '10px', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {[
              { id: 'descuentos', label: 'Códigos de descuento' },
              { id: 'productos', label: 'Explorar productos' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '0.55rem 1.1rem', borderRadius: '7px', border: 'none',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  background: tab === t.id ? 'var(--accent)' : 'transparent',
                  color: tab === t.id ? '#fff' : 'var(--subtle)',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Descuentos ── */}
          {tab === 'descuentos' && (
            <>
              {loadingD ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {Array.from({ length: 6 }).map((_, i) => <DiscountSkeleton key={i} />)}
                </div>
              ) : activeDescuentos.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '16px', padding: '5rem 2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1.25rem', display: 'block' }}>
                    <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
                  </svg>
                  <p style={{ fontWeight: 700, color: '#374151', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    Sin descuentos activos ahora
                  </p>
                  <p style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>
                    Pronto tendremos nuevas promociones. ¡Vuelve pronto!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {activeDescuentos.map(d => <DiscountCard key={d.id} d={d} />)}
                </div>
              )}
            </>
          )}

          {/* ── Tab: Productos ── */}
          {tab === 'productos' && (
            <div className="products-grid">
              {loadingP
                ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                : productos.map(p => <ProductCard key={p.id} product={p} />)
              }
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default PromocionesPage
