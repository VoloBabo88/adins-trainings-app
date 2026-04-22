import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#1a1a1a', borderRadius: '20px 20px 0 0',
        padding: '24px 20px', width: '100%', maxWidth: 430,
        maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.3s ease',
      }}>
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h2>
            <button onClick={onClose} style={{
              background: '#2a2a2a', border: 'none', borderRadius: 8,
              padding: 8, cursor: 'pointer', color: '#888', display: 'flex',
            }}>
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
