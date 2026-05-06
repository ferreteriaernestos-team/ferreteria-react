const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const VENTAS = [3200, 4100, 3800, 5200, 4800, 6100, 5500, 7200, 6800, 8100, 7500, 9200]
const MAX_VENTA = Math.max(...VENTAS)

const CATEGORIAS_VENTAS = [
  { name: 'Herramientas', value: 42, color: '#FF6B35' },
  { name: 'Construcción', value: 28, color: '#1565C0' },
  { name: 'Eléctrico',    value: 15, color: '#2E7D32' },
  { name: 'Fontanería',   value: 10, color: '#f57f17' },
  { name: 'Pintura',      value: 5,  color: '#6a1b9a' },
]

const RESUMEN = [
  { label: 'Ingresos totales', value: '$72,450.00', change: '+12.5%', up: true },
  { label: 'Pedidos totales',  value: '284',        change: '+8.3%',  up: true },
  { label: 'Ticket promedio',  value: '$255.00',    change: '+3.9%',  up: true },
  { label: 'Devoluciones',     value: '12',         change: '-2.1%',  up: false },
]

function AdminReportes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {RESUMEN.map((r, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '12px', padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--subtle)', marginBottom: '0.5rem' }}>{r.label}</p>
            <p style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{r.value}</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.35rem', color: r.up ? '#2E7D32' : '#c62828' }}>
              {r.change} vs mes anterior
            </p>
          </div>
        ))}
      </div>

      {/* Gráfica de ventas */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          📈 Ventas mensuales 2026
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px' }}>
          {VENTAS.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--subtle)', fontWeight: 600 }}>
                ${(v/1000).toFixed(1)}k
              </span>
              <div style={{
                width: '100%', background: i === 3 ? 'var(--accent)' : '#e3f2fd',
                borderRadius: '6px 6px 0 0',
                height: `${(v / MAX_VENTA) * 160}px`,
                transition: '0.3s ease',
                minHeight: '8px'
              }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--subtle)' }}>{MESES[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Ventas por categoría */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            📦 Ventas por categoría
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {CATEGORIAS_VENTAS.map((cat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cat.color }}>{cat.value}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${cat.value}%`,
                    background: cat.color, borderRadius: '4px',
                    transition: '0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla resumen mensual */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            📅 Resumen por mes
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Mes', 'Ventas', 'Pedidos', 'Promedio'].map(h => (
                  <th key={h} style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--subtle)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MESES.slice(0, 6).map((mes, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.8rem', fontWeight: 500 }}>{mes}</td>
                  <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.8rem', fontWeight: 700 }}>${VENTAS[i].toLocaleString()}</td>
                  <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.8rem' }}>{Math.round(VENTAS[i] / 255)}</td>
                  <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.8rem', color: 'var(--subtle)' }}>$255</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminReportes