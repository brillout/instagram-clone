import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  showClose?: boolean
}

/** Full-screen overlay that closes on backdrop click and the Escape key. */
export default function Modal({ onClose, children, showClose = true }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      {showClose && (
        <button
          className="modal-close icon-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={28} strokeWidth={1.5} />
        </button>
      )}
      <div onMouseDown={(e) => e.stopPropagation()} style={{ display: 'contents' }}>
        {children}
      </div>
    </div>
  )
}
