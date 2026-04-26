import { useState } from 'react'
import { ChevronRight, Dumbbell, Activity } from 'lucide-react'
import { WeekCalendar } from '../components/WeekCalendar'
import { Spinner } from '../components/Spinner'
import { WorkoutSessionModal } from '../components/WorkoutSessionModal'
import { getMuscleIcon, detectPrimaryMuscle } from '../components/MuscleIcons'
import { useTrainingPlan } from '../hooks/useTrainingPlan'
import { useTodayWorkout } from '../hooks/useTodayWorkout'
import { Profile, TrainingDay, PlanExercise } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

interface Props { userId: string; profile: Profile | null }

const WD: { [k: number]: string } = { 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa', 0: 'So' }

const DAY_DESC: { [k: string]: string } = {
  Push: 'Fokus auf Brust, Schultern und Trizeps. Gib alles!',
  Pull: 'Fokus auf Rücken und Bizeps. Volle Intensität!',
  Beine: 'Beine-Tag! Kein Überspringen — Beine sind wichtig.',
  'Schultern & Arme': 'Arme und Schultern heute. Präzision ist alles!',
  'Brust & Rücken': 'Oberkörper komplett. Du schaffst das!',
  Ganzkörper: 'Ganzkörper-Training. Alles in einem!',
  Ruhetag: 'Heute erholt sich dein Körper. Regeneration ist Training!',
}

function TodayCard({ day, exercises, onStartTraining }: { day: TrainingDay; exercises: PlanExercise[]; onStartTraining: () => void }) {
  const { accent } = useTheme()
  const muscle = detectPrimaryMuscle(exercises, day.is_rest_day ? 'Ruhetag' : day.label)

  return (
    <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
      {/* Background muscle icon */}
      <div style={{ position: 'absolute', right: 20, bottom: 16, opacity: 0.12 }}>
        {getMuscleIcon(muscle, 100, '#fff')}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, background: `${accent}22`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getMuscleIcon(muscle, 16, accent)}
          </div>
          <div style={{ fontSize: 12, color: accent, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {day.is_rest_day ? 'Ruhetag' : 'Heute'}
          </div>
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{day.label}</h2>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 20px', maxWidth: '65%', lineHeight: 1.4 }}>
          {DAY_DESC[day.label] || `${day.label} steht heute auf dem Plan!`}
        </p>
        {!day.is_rest_day && (
          <button
            onClick={onStartTraining}
            style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Training starten
          </button>
        )}
      </div>
    </div>
  )
}

function ExerciseList({ exercises, cardio }: { exercises: PlanExercise[]; cardio: { id: string; label: string; duration_minutes: number }[] }) {
  const { accent } = useTheme()
  if (exercises.length === 0 && cardio.length === 0) return null
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Übungen heute</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {exercises.map((ex, i) => (
          <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < exercises.length - 1 || cardio.length > 0 ? '1px solid #222' : 'none' }}>
            <div style={{ width: 40, height: 40, background: '#2a2a2a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {getMuscleIcon(ex.muscle_group || 'Ganzkörper', 20, '#888')}
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
        {cardio.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
            <div style={{ width: 40, height: 40, background: `${accent}22`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Activity size={20} color={accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>{c.label} — {c.duration_minutes} Min</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FlexiblePicker({ days, exercises, selectedDayId, onSelect }: {
  days: TrainingDay[]
  exercises: { [dayId: string]: PlanExercise[] }
  selectedDayId: string | null
  onSelect: (day: TrainingDay) => void
}) {
  const { accent } = useTheme()
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Was trainierst du heute?</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {days.map(day => {
          const isSelected = selectedDayId === day.id
          const dayExs = exercises[day.id] || []
          const muscle = detectPrimaryMuscle(dayExs, day.is_rest_day ? 'Ruhetag' : day.label)
          return (
            <div key={day.id} onClick={() => onSelect(day)} style={{
              background: isSelected ? '#1e1535' : '#1a1a1a',
              border: `1.5px solid ${isSelected ? accent : '#2a2a2a'}`,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ width: 44, height: 44, background: isSelected ? `${accent}22` : '#2a2a2a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {getMuscleIcon(muscle, 22, isSelected ? accent : '#666')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{day.label}</div>
                {!day.is_rest_day && dayExs.length > 0 && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{dayExs.length} Übungen</div>
                )}
                {day.is_rest_day && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Erholen & regenerieren</div>
                )}
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: isSelected ? accent : 'transparent',
                border: `2px solid ${isSelected ? accent : '#444'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TrainingPage({ userId, profile }: Props) {
  const { accent } = useTheme()
  const { plan, days, exercises, cardioSessions, loading } = useTrainingPlan(userId)
  const { todayLog, selectDay, refetch: refetchLog } = useTodayWorkout(userId)
  const isFlexible = profile?.plan_type === 'flexible'
  const [sessionOpen, setSessionOpen] = useState(false)

  if (loading) return <Spinner />

  const todayWd = WD[new Date().getDay()]

  const activeDay: TrainingDay | undefined = isFlexible
    ? (todayLog?.training_day_id ? days.find(d => d.id === todayLog.training_day_id) : undefined)
    : days.find(d => d.weekday === todayWd)

  const activeExercises: PlanExercise[] = activeDay ? (exercises[activeDay.id] || []) : []
  const activeCardio = isFlexible ? [] : cardioSessions.filter(c => c.weekday === todayWd)

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 20, paddingBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Training</h1>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          {isFlexible ? 'Wähle dein heutiges Training' : 'Dein Plan für diese Woche'}
        </p>
      </div>

      <div className="page-content" style={{ paddingTop: 16 }}>
        {!isFlexible && (
          <div style={{ marginBottom: 20 }}>
            <WeekCalendar days={days} exercises={exercises} />
          </div>
        )}

        {!plan ? (
          <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <Dumbbell size={40} color="#333" style={{ marginBottom: 12 }} />
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>Kein Trainingsplan</h3>
            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Erstelle deinen ersten Plan im Profil.</p>
          </div>
        ) : isFlexible ? (
          <>
            <FlexiblePicker
              days={days}
              exercises={exercises}
              selectedDayId={todayLog?.training_day_id ?? null}
              onSelect={day => selectDay(day.label, day.is_rest_day, day.id)}
            />
            {activeDay && (
              <TodayCard
                day={activeDay}
                exercises={activeExercises}
                onStartTraining={() => setSessionOpen(true)}
              />
            )}
            {activeDay && !activeDay.is_rest_day && (
              <ExerciseList exercises={activeExercises} cardio={[]} />
            )}
          </>
        ) : (
          <>
            {activeDay && (
              <TodayCard
                day={activeDay}
                exercises={activeExercises}
                onStartTraining={() => setSessionOpen(true)}
              />
            )}
            {(activeExercises.length > 0 || activeCardio.length > 0) && (
              <ExerciseList exercises={activeExercises} cardio={activeCardio} />
            )}

            {/* Full week list */}
            <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Wochenplan</div>
              {days.map((day, i) => {
                const dayExs = exercises[day.id] || []
                const muscle = detectPrimaryMuscle(dayExs, day.is_rest_day ? 'Ruhetag' : day.label)
                return (
                  <div key={day.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < days.length - 1 ? '1px solid #1f1f1f' : 'none' }}>
                    <div style={{ width: 36, height: 36, background: day.weekday === todayWd ? accent : '#2a2a2a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{day.weekday}</span>
                    </div>
                    <div style={{ width: 28, height: 28, background: '#2a2a2a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {getMuscleIcon(muscle, 16, day.is_rest_day ? '#444' : '#888')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: day.is_rest_day ? '#555' : '#fff' }}>{day.label}</div>
                      {!day.is_rest_day && dayExs.length > 0 && (
                        <div style={{ fontSize: 12, color: '#666' }}>{dayExs.length} Übungen</div>
                      )}
                    </div>
                    <ChevronRight size={16} color="#333" />
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {sessionOpen && activeDay && !activeDay.is_rest_day && (
        <WorkoutSessionModal
          userId={userId}
          workoutLogId={todayLog?.id ?? null}
          dayLabel={activeDay.label}
          exercises={activeExercises}
          onClose={() => setSessionOpen(false)}
          onComplete={() => { setSessionOpen(false); refetchLog() }}
        />
      )}
    </div>
  )
}
