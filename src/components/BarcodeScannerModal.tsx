import { useEffect, useRef, useState } from 'react'
import { X, Loader, AlertCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface ProductData {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Props {
  onClose: () => void
  onProduct: (data: ProductData) => void
}

// Minimal BarcodeDetector interface for TS
interface BarcodeResult { rawValue: string; format: string }
interface BarcodeDetectorInstance { detect(source: HTMLVideoElement): Promise<BarcodeResult[]> }
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorInstance

export function BarcodeScannerModal({ onClose, onProduct }: Props) {
  const { accent } = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const doneRef = useRef(false)
  const onProductRef = useRef(onProduct)
  useEffect(() => { onProductRef.current = onProduct }, [onProduct])

  const [status, setStatus] = useState<'starting' | 'scanning' | 'fetching' | 'error'>('starting')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const init = async () => {
      if (!('BarcodeDetector' in window)) {
        setStatus('error')
        setErrorMsg('Dein Browser unterstützt den Barcode-Scanner nicht. Bitte Chrome auf Android verwenden oder Daten manuell eingeben.')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setStatus('scanning')

        const Detector = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector
        const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] })

        const scan = async () => {
          if (doneRef.current || !videoRef.current) return
          try {
            const results = await detector.detect(videoRef.current)
            if (results.length > 0 && !doneRef.current) {
              doneRef.current = true
              stopStream()
              fetchProduct(results[0].rawValue)
              return
            }
          } catch { /* ignore frame errors */ }
          if (!doneRef.current) rafRef.current = window.setTimeout(scan, 200) as unknown as number
        }

        rafRef.current = window.setTimeout(scan, 200) as unknown as number
      } catch (e) {
        setStatus('error')
        setErrorMsg('Kamera konnte nicht geöffnet werden. Bitte Kamerazugriff erlauben.')
      }
    }

    init()

    return () => {
      doneRef.current = true
      clearTimeout(rafRef.current)
      stopStream()
    }
  }, [])

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  const fetchProduct = async (barcode: string) => {
    setStatus('fetching')
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const json = await res.json()
      if (json.status === 1 && json.product) {
        const p = json.product
        const n = p.nutriments
        onProductRef.current({
          name: p.product_name_de || p.product_name || barcode,
          calories: Math.round(n?.['energy-kcal_100g'] ?? n?.['energy-kcal'] ?? 0),
          protein: Math.round(n?.proteins_100g ?? 0),
          carbs: Math.round(n?.carbohydrates_100g ?? 0),
          fat: Math.round(n?.fat_100g ?? 0),
        })
      } else {
        setStatus('error')
        setErrorMsg(`Produkt "${barcode}" nicht in der Datenbank gefunden. Bitte manuell eingeben.`)
      }
    } catch {
      setStatus('error')
      setErrorMsg('Netzwerkfehler beim Laden der Produktdaten.')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 1100, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', paddingTop: 'calc(16px + env(safe-area-inset-top))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', borderBottom: '1px solid #1f1f1f', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
          <X size={22} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Barcode scannen</span>
        <div style={{ width: 22 }} />
      </div>

      {/* Camera viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }}>
        {status !== 'error' && (
          <div style={{ width: '100%', maxWidth: 360, position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#111' }}>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: '100%', display: 'block', borderRadius: 16, aspectRatio: '4/3', objectFit: 'cover' }}
            />
            {/* Scanner overlay */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '65%', height: '30%', border: `2px solid ${accent}`, borderRadius: 8, boxShadow: `0 0 0 9999px rgba(0,0,0,0.45)` }} />
            </div>
          </div>
        )}

        {status === 'scanning' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>Barcode in den Rahmen halten</div>
            <div style={{ fontSize: 12, color: '#555' }}>EAN-8 · EAN-13 · UPC-A · UPC-E</div>
          </div>
        )}

        {(status === 'starting' || status === 'fetching') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Loader size={28} color={accent} style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 14, color: '#888' }}>
              {status === 'starting' ? 'Kamera wird geöffnet…' : 'Produktdaten werden geladen…'}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 24, textAlign: 'center', maxWidth: 320 }}>
            <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: '#ccc', lineHeight: 1.5, marginBottom: 20 }}>{errorMsg}</div>
            <button className="btn-primary" onClick={onClose}>Manuell eingeben</button>
          </div>
        )}
      </div>
    </div>
  )
}
