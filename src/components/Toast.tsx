import { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

function Toast({ message, type, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300) }, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : -80}px)`,
      opacity: visible ? 1 : 0, transition: 'all 0.3s ease', zIndex: 9999,
      background: type === 'success' ? '#0d2010' : '#1a0808',
      border: `1px solid ${type === 'success' ? '#22c55e' : '#ef4444'}`,
      borderRadius: 12, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      maxWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      {type === 'success' ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
      <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{message}</span>
    </div>
  )
}

interface ToastState { message: string; type: 'success' | 'error'; id: number }
let toastId = 0
let showToastFn: ((msg: string, type: 'success' | 'error') => void) | null = null

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  showToastFn?.(message, type)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([])
  useEffect(() => {
    showToastFn = (message, type) => setToasts(prev => [...prev, { message, type, id: ++toastId }])
    return () => { showToastFn = null }
  }, [])
  return (
    <>
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type}
          onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
      ))}
    </>
  )
}
