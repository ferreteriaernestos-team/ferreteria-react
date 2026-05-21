function StatusBadge({ label, colorMap, value }) {
  const style = colorMap[value] || { bg: '#f5f5f5', color: '#555' }
  return (
    <span style={{
      padding: '0.25rem 0.6rem', borderRadius: '20px',
      fontSize: '0.75rem', fontWeight: 600,
      background: style.bg, color: style.color,
    }}>
      {label || value}
    </span>
  )
}

export default StatusBadge
