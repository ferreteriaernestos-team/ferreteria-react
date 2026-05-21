const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 700,
}

const containerBase = {
  position: 'fixed', top: '50%', left: '50%', zIndex: 800,
  transform: 'translate(-50%,-50%)', background: '#fff',
  borderRadius: '12px', padding: '2rem', width: '100%',
  boxShadow: '0 8px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto',
}

function Modal({ onClose, maxWidth = '480px', children }) {
  return (
    <>
      <div onClick={onClose} style={overlayStyle} />
      <div style={{ ...containerBase, maxWidth }}>{children}</div>
    </>
  )
}

export default Modal
