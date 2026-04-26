import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus, Check, Timer, Dumbbell } from 'lucide-react'
import { PlanExercise, supabase } from '../lib/supabase'
import { showToast } from './Toast'
import { useTheme } from '../context/ThemeContext'

interface SetData {
  weight: string
  reps: string
  completed: boolean
}

interface ExerciseState {
  exercise: PlanExercise
  sets: SetData[]
}

interface Props {
  userId: string
  workoutLogId: string | null
  dayLabel: string
  exercises: PlanExercise[]
  onClose: () => void
  onComplete: () => void
}

function formatTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function WorkoutSessionModal({ userId, workoutLogId, dayLabel, exercises, onClose, onComplete }: Props) {
  const { accent } = useTheme()
  const startTimeRef = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [restTimer, setRestTimer] = useState<number | null>(null)
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [saving, setSaving] = useState(false)

  const [exerciseStates, setExerciseStates] = useState<ExerciseState[]>(() =>
    exercises.map(ex => ({
      exercise: ex,
      sets: Array.from({ length: Math.max(ex.sets, 1) }, () => ({ weight: '', reps: '', completed: false })),
    }))
  )

  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current) }
  }, [])

  const startRestTimer = useCallback((seconds = 90) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    setRestTimer(seconds)
    restIntervalRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const completeSet = (exIdx: number, setIdx: number) => {
    setExerciseStates(prev =>
      prev.map((es, i) =>
        i !== exIdx ? es : { ...es, sets: es.sets.map((s, j) => j === setIdx ? { ...s, completed: true } : s) }
      )
    )
    startRestTimer(90)
  }

  const addSet = (exIdx: number) => {
    setExerciseStates(prev =>
      prev.map((es, i) =>
        i !== exIdx ? es : { ...es, sets: [...es.sets, { weight: '', reps: '', completed: false }] }
      )
    )
  }

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: string) => {
    setExerciseStates(prev =>
      prev.map((es, i) =>
        i !== exIdx ? es : { ...es, sets: es.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s) }
      )
    )
  }

  const handleFinish = async () => {
    setSaving(true)
    const durationMin = Math.max(1, Math.round(elapsed / 60))
    const today = new Date().toISOString().split('T')[0]

    try {
      let logId = workoutLogId

      if (logId) {
        await supabase.from('workout_logs').update({ completed: true, duration_minutes: durationMin }).eq('id', logId)
      } else {
        const { data } = await supabase.from('workout_logs').insert({
          user_id: userId, date: today, label: dayLabel, completed: true, duration_minutes: durationMin,
        }).select().single()
        logId = data?.id ?? null
      }

      if (logId) {
        const rows = exerciseStates.flatMap(es =>
          es.sets
            .filter((s, idx) => s.completed || s.weight || s.reps || idx === 0)
            .map((s, setIdx) => ({
              workout_log_id: logId,
              user_id: userId,
              exercise_name: es.exercise.name,
              set_number: setIdx + 1,
              weight_kg: parseFloat(s.weight) || null,
              reps: parseInt(s.reps) || null,
              completed: s.completed,
            }))
        )
        if (rows.length > 0) {
          await supabase.from('workout_sets').insert(rows)
        }
      }

      showToast('Training gespeichert! 💪', 'success')
      onComplete()
    } catch {
      showToast('Fehler beim Speichern', 'error')
    }
    setSaving(false)
  }

  const inpStyle: React.CSSProperties = {
    background: '#2a2a2a', border: '1px solid #333', borderRadius: 8,
    padding: '8px', color: '#fff', textAlign: 'center',
    fontSize: 15, width: '100%', fontFamily: 'inherit', outline: 'none',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', paddingTop: 'calc(16px + env(safe-area-inset-top))', background: '#111', borderBottom: '1px solid #1f1f1f', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}>
            <X size={22} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{dayLabel}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: -1 }}>
              {formatTime(elapsed)}
            </div>
          </div>
          <div style={{ width: 30 }} />
        </div>
      </div>

      {/* Rest timer banner */}
      {restTimer !== null && (
        <div style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: `${accent}22`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Timer size={18} color={accent} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888' }}>Pause</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{formatTime(restTimer)}</div>
          </div>
          <button
            onClick={() => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); setRestTimer(null) }}
            style={{ marginLeft: 'auto', background: '#2a2a2a', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#888', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Überspringen
          </button>
        </div>
      )}

      {/* Exercise list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px' }}>
        {exerciseStates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
            <Dumbbell size={40} color="#333" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Keine Übungen für diesen Tag</div>
          </div>
        )}

        {exerciseStates.map((es, exIdx) => (
          <div key={es.exercise.id} style={{ background: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{es.exercise.name}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                {es.exercise.muscle_group && `${es.exercise.muscle_group} · `}
                {es.exercise.sets} Sätze · {es.exercise.reps_min}–{es.exercise.reps_max} Wdh.
              </div>
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 38px', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: '#555', textAlign: 'center', textTransform: 'uppercase' }}>Satz</span>
              <span style={{ fontSize: 10, color: '#555', textAlign: 'center', textTransform: 'uppercase' }}>kg</span>
              <span style={{ fontSize: 10, color: '#555', textAlign: 'center', textTransform: 'uppercase' }}>Wdh.</span>
              <span />
            </div>

            {es.sets.map((set, setIdx) => (
              <div key={setIdx} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 38px', gap: 6, marginBottom: 6, alignItems: 'center', opacity: set.completed ? 0.45 : 1, transition: 'opacity 0.2s' }}>
                <span style={{ fontSize: 13, color: '#666', textAlign: 'center', fontWeight: 700 }}>{setIdx + 1}</span>
                <input
                  type="number"
                  value={set.weight}
                  onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                  disabled={set.completed}
                  placeholder="—"
                  style={{ ...inpStyle, borderColor: set.completed ? '#222' : '#333' }}
                />
                <input
                  type="number"
                  value={set.reps}
                  onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                  disabled={set.completed}
                  placeholder="—"
                  style={{ ...inpStyle, borderColor: set.completed ? '#222' : '#333' }}
                />
                <button
                  onClick={() => { if (!set.completed) completeSet(exIdx, setIdx) }}
                  style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: set.completed ? accent : 'transparent',
                    border: `2px solid ${set.completed ? accent : '#444'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: set.completed ? 'default' : 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <Check size={16} color={set.completed ? '#fff' : '#555'} strokeWidth={2.5} />
                </button>
              </div>
            ))}

            <button
              onClick={() => addSet(exIdx)}
              style={{ background: 'none', border: '1px dashed #333', borderRadius: 8, padding: '8px 12px', color: '#666', fontSize: 13, fontWeight: 600, width: '100%', cursor: 'pointer', marginTop: 6, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Plus size={14} /> Satz hinzufügen
            </button>
          </div>
        ))}

        <button
          className="btn-primary"
          onClick={handleFinish}
          disabled={saving}
          style={{ marginTop: 8, marginBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
        >
          {saving ? 'Wird gespeichert…' : 'Training beenden'}
        </button>
      </div>
    </div>
  )
}
