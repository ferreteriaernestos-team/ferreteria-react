import { useCart } from '../../context/CartContext'
import Toast from './Toast'

function ToastContainer() {
  const { toasts, removeToast } = useCart()

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

export default ToastContainer