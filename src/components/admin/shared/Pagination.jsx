const btnStyle = {
  padding: '0.5rem 1rem', borderRadius: '6px',
  border: '1px solid var(--border)', cursor: 'pointer', background: '#fff',
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
      <button
        onClick={() => onPageChange(p => Math.max(1, p - 1))}
        disabled={page === 1}
        style={btnStyle}
      >
        Anterior
      </button>
      <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        style={btnStyle}
      >
        Siguiente
      </button>
    </div>
  )
}

export default Pagination
