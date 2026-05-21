import { useEffect } from 'react'

function Toast({ message, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="toast">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>{message}</span>
    </div>
  )
}

export default Toast