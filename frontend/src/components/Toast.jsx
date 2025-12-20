import { useEffect } from 'react'
import '../styles/Toast.css'

function Toast({ message, type = 'info', onClose, duration = 5000, actionLabel, onAction }) {
  useEffect(() => {
    // Si duration est 0 ou négatif, ne pas auto-fermer
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
      default:
        return 'ℹ'
    }
  }

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <div className="toast-message">{message}</div>
        {actionLabel && onAction && (
          <button className="toast-action" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      <button className="toast-close" onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  )
}

export default Toast
