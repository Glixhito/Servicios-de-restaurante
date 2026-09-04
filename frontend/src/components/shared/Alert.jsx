import { X } from 'lucide-react'

export default function Alert({ type = 'info', message, onClose }) {
  const typeStyles = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
  }

  return (
    <div className={`alert ${typeStyles[type]} flex justify-between items-center`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose}>
          <X size={20} />
        </button>
      )}
    </div>
  )
}