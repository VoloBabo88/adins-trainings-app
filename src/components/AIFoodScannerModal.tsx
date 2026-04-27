import { useEffect, useRef, useState } from 'react'
import { X, Camera, Upload, Loader, AlertCircle, Check, ChevronRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface FoodResult {
  name: string
  portion_description: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  confidence: string
  ingredients: string[]
  note: string
}

interface Props {
  onClose: () => void
  onProduct: (data: { name: string; calories: number; protein: number; carbs: number; fat: number }) => void
}

type Phase = 'capture' | 'thinking' | 'generating' | 'result' | 'error'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

async function analyzeFood(imageBase64: string, mediaType: string): Promise<FoodResult> {
  if (!API_KEY) throw new Error('VITE_ANTHROPIC_API_KEY nicht gesetzt')

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }

  // Step 1: Opus thinks deeply about the food
  const thinkingRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 12000,
      thinking: { type: 'enabled', budget_tokens: 8000 },
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 },
          },
          {
            type: 'text',
            text: 'Analyze this food image in detail. Think carefully about: what exact dish this is, all visible ingredients, estimated portion size and weight in grams, and precise nutritional values. Consider cooking methods and hidden ingredients like oils.',
          },
        ],
      }],
    }),
  })

  if (!thinkingRes.ok) {
    const err = await thinkingRes.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message || `Opus API Fehler ${thinkingRes.status}`)
  }

  const thinkingData = await thinkingRes.json()
  const opusAnalysis = (thinkingData.content as Array<{ type: string; text?: string }>)
    .find(b => b.type === 'text')?.text || ''

  // Step 2: Sonnet produces clean structured JSON
  const sonnetRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Based on this detailed food analysis: "${opusAnalysis}"

Return ONLY this JSON, no other text:
{
  "name": "dish name in German",
  "portion_description": "estimated portion",
  "calories": 450,
  "protein_g": 35,
  "carbs_g": 42,
  "fat_g": 12,
  "confidence": "hoch",
  "ingredients": ["ingredient1", "ingredient2"],
  "note": "brief accuracy note in German"
}`,
      }],
    }),
  })

  if (!sonnetRes.ok) {
    const err = await sonnetRes.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message || `Sonnet API Fehler ${sonnetRes.status}`)
  }

  const sonnetData = await sonnetRes.json()
  const text = (sonnetData.content as Array<{ type: string; text?: string }>)[0]?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Ungültige KI-Antwort')
  return JSON.parse(match[0]) as FoodResult
}

function toBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [header, base64] = result.split(',')
      const mediaType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
      resolve({ base64, mediaType })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function AIFoodScannerModal({ onClose, onProduct }: Props) {
  const { accent } = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('capture')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<FoodResult | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch {
        // Camera unavailable — file upload still works
      }
    }
    start()
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  const runAnalysis = async (base64: string, mediaType: string, preview: string) => {
    stopCamera()
    setPreviewSrc(preview)
    setPhase('thinking')
    try {
      setPhase('thinking')
      const food = await (async () => {
        // After opus starts (we use a single async call but update UI at the right moment)
        const thinkingPromise = analyzeFood(base64, mediaType)
        // Switch to "generating" phase mid-way is not feasible without splitting the call,
        // so we show thinking until the final result arrives (both steps finish together).
        // To give visual feedback of the two phases, we use a timer to switch at ~60% of expected time.
        const phaseTimer = setTimeout(() => setPhase('generating'), 8000)
        try {
          const r = await thinkingPromise
          clearTimeout(phaseTimer)
          return r
        } catch (e) {
          clearTimeout(phaseTimer)
          throw e
        }
      })()
      setResult(food)
      setPhase('result')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unbekannter Fehler')
      setPhase('error')
    }
  }

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    const [, base64] = dataUrl.split(',')
    runAnalysis(base64, 'image/jpeg', dataUrl)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { base64, mediaType } = await toBase64(file)
      const preview = `data:${mediaType};base64,${base64}`
      runAnalysis(base64, mediaType as string, preview)
    } catch {
      setErrorMsg('Bild konnte nicht geladen werden.')
      setPhase('error')
    }
  }

  const handleConfirm = () => {
    if (!result) return
    onProduct({
      name: result.name,
      calories: result.calories,
      protein: result.protein_g,
      carbs: result.carbs_g,
      fat: result.fat_g,
    })
  }

  const confidenceColor = (c: string) =>
    c === 'hoch' ? '#22c55e' : c === 'mittel' ? '#eab308' : '#ef4444'

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 1100, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', paddingTop: 'calc(16px + env(safe-area-inset-top))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', borderBottom: '1px solid #1f1f1f', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
          <X size={22} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>KI Lebensmittel-Analyse</span>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20, overflowY: 'auto' }}>

        {/* CAPTURE phase */}
        {phase === 'capture' && (
          <>
            <div style={{ width: '100%', maxWidth: 360, position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#111', aspectRatio: '4/3' }}>
              {cameraReady ? (
                <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Camera size={48} color="#333" />
                  <span style={{ fontSize: 13, color: '#555' }}>Kamera nicht verfügbar</span>
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, border: `2px solid ${accent}33`, borderRadius: 16, pointerEvents: 'none' }} />
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 360 }}>
              {cameraReady && (
                <button onClick={handleCapture} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: accent, border: 'none', borderRadius: 14, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Camera size={20} /> Foto aufnehmen
                </button>
              )}
              <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#1a1a1a', border: `1px solid #333`, borderRadius: 14, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Upload size={20} /> Bild wählen
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />

            {!API_KEY && (
              <div style={{ background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 12, padding: 14, width: '100%', maxWidth: 360 }}>
                <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>API-Key fehlt</div>
                <div style={{ fontSize: 12, color: '#888' }}>Bitte <code>VITE_ANTHROPIC_API_KEY</code> in der <code>.env</code> Datei setzen und neu bauen.</div>
              </div>
            )}
          </>
        )}

        {/* THINKING phase */}
        {phase === 'thinking' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 360 }}>
            {previewSrc && <img src={previewSrc} alt="Aufgenommenes Foto" style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 220 }} />}
            <Loader size={32} color={accent} style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 6 }}>KI denkt nach…</div>
              <div style={{ fontSize: 13, color: '#888' }}>Claude Opus analysiert dein Essen gründlich</div>
            </div>
            <div style={{ width: '100%', background: '#1a1a1a', borderRadius: 12, padding: 14 }}>
              {['Gericht identifizieren', 'Zutaten erkennen', 'Portionsgröße schätzen', 'Nährwerte berechnen'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 3 ? '1px solid #222' : 'none' }}>
                  <Loader size={14} color={accent} style={{ animation: 'spin 1s linear infinite', animationDelay: `${i * 0.25}s` }} />
                  <span style={{ fontSize: 13, color: '#888' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GENERATING phase */}
        {phase === 'generating' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 360 }}>
            {previewSrc && <img src={previewSrc} alt="Aufgenommenes Foto" style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 220 }} />}
            <Loader size={32} color={accent} style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Ergebnis wird erstellt…</div>
              <div style={{ fontSize: 13, color: '#888' }}>Claude Sonnet strukturiert die Nährwerte</div>
            </div>
          </div>
        )}

        {/* RESULT phase */}
        {phase === 'result' && result && (
          <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {previewSrc && <img src={previewSrc} alt="Analysiertes Foto" style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 200 }} />}

            <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', flex: 1 }}>{result.name}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: confidenceColor(result.confidence), background: `${confidenceColor(result.confidence)}22`, borderRadius: 6, padding: '2px 8px', marginLeft: 8, flexShrink: 0 }}>
                  {result.confidence}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>{result.portion_description}</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'kcal',    value: result.calories, color: '#f97316' },
                  { label: 'Protein', value: `${result.protein_g}g`, color: '#22c55e' },
                  { label: 'Carbs',   value: `${result.carbs_g}g`,   color: '#eab308' },
                  { label: 'Fett',    value: `${result.fat_g}g`,     color: accent     },
                ].map(m => (
                  <div key={m.label} style={{ background: '#2a2a2a', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {result.ingredients.length > 0 && (
                <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
                  {result.ingredients.join(' · ')}
                </div>
              )}

              {result.note && (
                <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>{result.note}</div>
              )}
            </div>

            <button onClick={handleConfirm} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: accent, border: 'none', borderRadius: 14, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Check size={20} /> Mahlzeit übernehmen
            </button>
            <button onClick={() => { setPhase('capture'); setResult(null); setPreviewSrc(null) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'none', border: '1px solid #333', borderRadius: 14, padding: '12px 0', color: '#888', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Nochmal scannen
            </button>
          </div>
        )}

        {/* ERROR phase */}
        {phase === 'error' && (
          <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 24, textAlign: 'center', maxWidth: 320, width: '100%' }}>
            <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: '#ccc', lineHeight: 1.5, marginBottom: 20 }}>{errorMsg}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPhase('capture'); setPreviewSrc(null) }} style={{ flex: 1, background: '#2a2a2a', border: 'none', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Erneut versuchen
              </button>
              <button onClick={onClose} style={{ flex: 1, background: accent, border: 'none', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Manuell eingeben
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
