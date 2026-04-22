import { Calendar, ChevronRight, Dumbbell, Activity } from 'lucide-react'
import { WeekCalendar } from '../components/WeekCalendar'
import { Spinner } from '../components/Spinner'
import { useTrainingPlan } from '../hooks/useTrainingPlan'
import { TrainingDay, PlanExercise } from '../lib/supabase'

interface Props { userId: string }

const WD: { [k: number]: string } = { 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa', 0: 'So' }

const MUSCLE_ICONS: { [k: string]: string } = {
  Brust: '🫀', Rücken: '🦴', Schultern: '⚡', Bizeps: '💪', Trizeps: '🔱',
  Beine: '🦵', Gesäß: '🍑', Core: '🎯', Sonstiges: '🏋️',
}

const DAY_DESC: { [k: string]: string } = {
  Push: 'Fokus auf Brust, Schultern und Trizeps. Gib alles!',
  Pull: 'Fokus auf Rücken und Bizeps. Volle Intensität!',
  Beine: 'Beine-Tag! Kein Überspringen — Beine sind wichtig.',
  'Schultern & Arme': 'Arme und Schultern heute. Präzision ist alles!',
  'Brust & Rücken': 'Oberkörper komplett. Du schaffst das!',
  Ganzkörper: 'Ganzkörper-Training. Alles in einem!',
  Ruhetag: 'Heute erholt sich dein Körper. Regeneration ist Training!',
}

function BodySilhouette() {
  return (
    <svg width="90" height="120" viewBox="0 0 90 120" fill="none" opacity={0.35}>
      <circle cx="45" cy="18" r="12" fill="#7c3aed" />
      <rect x="28" y="32" width="34" height="40" rx="8" fill="#7c3aed" />
      <rect x="10" y="34" width="16" height="30" rx="6" fill="#6b21d4" />
      <rect x="64" y="34" width="16" height="30" rx="6" fill="#6b21d4" />
      <rect x="30" y="74" width="12" height="38" rx="6" fill="#7c3aed" />
      <rect x="48" y="74" width="12" height="38" rx="6" fill="#7c3aed" />
    </svg>
  )
}

export function TrainingPage({ userId }: Props) {
  const { plan, days, exercises, cardioSessions, loading } = useTrainingPlan(userId)

  if (loading) return <Spinner />

  const todayWd = WD[new Date().getDay()]
  const todayDay: TrainingDay | undefined = days.find(d => d.weekday === todayWd)
  const todayExercises: PlanExercise[] = todayDay ? (exercises[todayDay.id] || []) : []
  const todayCardio = cardioSessions.filter(c => c.weekday === todayWd)

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ paddingTop: 20, paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Trainingsplan</h1>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Dein Plan für diese Woche</p>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', marginTop: 4 }}>
          <Calendar size={22} />
        </button>
      </div>

      <div className="page-content" style={{ paddingTop: 16 }}>
        {/* Week calendar */}
        <div style={{ marginBottom: 20 }}>
          <WeekCalendar days={days} />
        </div>

        {!plan ? (
          <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <Dumbbell size={40} color="#333" style={{ marginBottom: 12 }} />
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>Kein Trainingsplan</h3>
            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Erstelle deinen ersten Plan im Profil.</p>
          </div>
        ) : (
          <>
            {/* Today card */}
            <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: 16, bottom: 8, opacity: 0.6 }}>
                <BodySilhouette />
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>Heute</div>
                <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                  {todayDay ? todayDay.label : '—'}
                </h2>
                <p style={{ fontSize: 14, color: '#888', margin: '0 0 20px', maxWidth: '65%', lineHeight: 1.4 }}>
                  {todayDay ? (DAY_DESC[todayDay.label] || `${todayDay.label} steht heute auf dem Plan!`) : 'Kein Training geplant.'}
                </p>
                {todayDay && !todayDay.is_rest_day && (
                  <button style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Training starten
                  </button>
                )}
              </div>
            </div>

            {/* Exercises today */}
            {(todayExercises.length > 0 || todayCardio.length > 0) && (
              <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Übungen heute</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {todayExercises.map((ex, i) => (
                    <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < todayExercises.length - 1 || todayCardio.length > 0 ? '1px solid #222' : 'none' }}>
                      <div style={{ width: 40, height: 40, background: '#2a2a2a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {MUSCLE_ICONS[ex.muscle_group || ''] || '🏋️'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{ex.name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{ex.muscle_group}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, color: '#888' }}>{ex.sets} Sätze</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{ex.reps_min}–{ex.reps_max} Wdh.</div>
                      </div>
                      <ChevronRight size={16} color="#333" />
                    </div>
                  ))}
                  {todayCardio.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                      <div style={{ width: 40, height: 40, background: 'rgba(124,58,237,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Activity size={20} color="#7c3aed" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>{c.label} — {c.duration_minutes} Min</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full week */}
            <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Wochenplan</div>
              {days.map((day, i) => (
                <div key={day.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < days.length - 1 ? '1px solid #1f1f1f' : 'none' }}>
                  <div style={{ width: 36, height: 36, background: day.weekday === todayWd ? '#7c3aed' : '#2a2a2a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{day.weekday}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: day.is_rest_day ? '#555' : '#fff' }}>{day.label}</div>
                    {!day.is_rest_day && exercises[day.id] && exercises[day.id].length > 0 && (
                      <div style={{ fontSize: 12, color: '#666' }}>{exercises[day.id].length} Übungen</div>
                    )}
                  </div>
                  <ChevronRight size={16} color="#333" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
