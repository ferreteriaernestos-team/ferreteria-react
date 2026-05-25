import { useState, useEffect } from 'react'
import { getReporteDiario, getReporteMensual, getTopProductos } from '../../services/api'
import { toArr } from '../../utils/parseResponse'
import * as Icons from './shared/Icons'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function pick(obj, ...keys) {
  for (const k of keys) if (obj?.[k] != null) return obj[k]
  return null
}

function AdminReportes() {
  const [diario, setDiario]     = useState(null)
  const [mensual, setMensual]   = useState(null)
  const [topProds, setTopProds] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      getReporteDiario().catch(() => ({ data: null })),
      getReporteMensual().catch(() => ({ data: null })),
      getTopProductos().catch(() => ({ data: null })),
    ]).then(([d, m, t]) => {
      // Backend response: { success, data: { ... }, timestamp }
      // Axios wraps in .data, so d.data = { success, data: {...}, timestamp }
      // We need d.data.data to get the actual payload
      const diarioData  = d.data?.data  ?? d.data  ?? null
      const mensualData = m.data?.data  ?? m.data  ?? null
      const topData     = t.data?.data  ?? t.data  ?? null
      setDiario(diarioData)
      setMensual(mensualData)
      // Backend top-productos: { productos: [...] }
      setTopProds(toArr(topData))
    })
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: 'var(--subtle)' }}>Cargando reportes...</p>

  // diario → { totalVentas (ingresos), cantidadVentas (count), productosVendidos }
  // mensual → { totalVentas (count), totalIngresos (ingresos) }
  const totalVentasHoy   = pick(diario, 'totalVentas', 'total_ventas', 'ingresos', 'total') ?? 0
  const totalPedidosHoy  = pick(diario, 'cantidadVentas', 'total_pedidos', 'totalPedidos', 'pedidos') ?? '–'
  const totalVentasMes   = pick(mensual, 'totalIngresos', 'total_ingresos', 'total_ventas', 'totalVentas', 'ingresos') ?? 0
  const totalPedidosMes  = pick(mensual, 'totalVentas', 'total_pedidos', 'totalPedidos', 'pedidos') ?? '–'

  const resumen = [
    { label: 'Ingresos hoy',     value: `$${parseFloat(totalVentasHoy).toFixed(2)}` },
    { label: 'Pedidos hoy',      value: totalPedidosHoy },
    { label: 'Ingresos del mes', value: `$${parseFloat(totalVentasMes).toFixed(2)}` },
    { label: 'Pedidos del mes',  value: totalPedidosMes },
  ]

  // El backend /reportes/mensual devuelve { totalVentas, totalIngresos } — no hay array por mes aún
  const ventasMensuales = toArr(pick(mensual, 'ventas_por_mes', 'ventasPorMes', 'por_mes', 'meses', 'ventas'))
  const maxVenta = Math.max(...ventasMensuales.map(v => parseFloat(v.total || v.ventas || 0)), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {resumen.map((r, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--subtle)', marginBottom: '0.5rem' }}>{r.label}</p>
            <p style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{r.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfica de ventas mensuales */}
      {ventasMensuales.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.TrendingUp size={18} color="var(--accent)" /> Ventas por mes</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px' }}>
            {ventasMensuales.map((v, i) => {
              const val = parseFloat(v.total || v.ventas || 0)
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--subtle)', fontWeight: 600 }}>
                    ${(val / 1000).toFixed(1)}k
                  </span>
                  <div style={{ width: '100%', background: '#e3f2fd', borderRadius: '6px 6px 0 0', height: `${(val / maxVenta) * 160}px`, minHeight: '4px' }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--subtle)' }}>{MESES[i] || v.mes || i + 1}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Top productos */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.Package size={18} color="var(--accent)" /> Productos más vendidos</h3>
          {topProds.length === 0 ? (
            <p style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>Sin datos</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {topProds.slice(0, 5).map((p, i) => {
                // Backend returns: { producto: "nombre", ventas: N }
                const nombre   = p.producto || p.nombre || p.name || '–'
                const vendidos = p.ventas ?? pick(p, 'total_vendido', 'totalVendido', 'cantidad', 'sold') ?? 0
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, color: i < 3 ? '#fff' : 'var(--subtle)' }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--subtle)' }}>{vendidos} unidades vendidas</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detalle diario */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.FileText size={18} color="var(--accent)" /> Reporte de hoy</h3>
          {diario ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  { key: 'totalVentas',    label: 'Ingresos del día',    format: v => `$${Number(v).toFixed(2)}` },
                  { key: 'cantidadVentas', label: 'Ventas realizadas',   format: v => `${v} venta${v !== 1 ? 's' : ''}` },
                  { key: 'totalIngresos',  label: 'Ingresos del mes',    format: v => `$${Number(v).toFixed(2)}` },
                ]
                  .filter(row => diario[row.key] != null)
                  .map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>{row.label}</td>
                    <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.875rem', fontWeight: 700, textAlign: 'right', color: 'var(--text)' }}>
                      {row.format(diario[row.key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--subtle)', fontSize: '0.875rem' }}>Sin datos para hoy</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminReportes
