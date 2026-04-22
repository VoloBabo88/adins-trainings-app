import { Check, CheckCircle } from 'lucide-react'
import { DayItem } from './Step3TrainingDays'
import { ExerciseItem } from './Step4Exercises'
import { CardioItem } from './Step6RestCardio'
import { Spinner } from '../../components/Spinner'

const GOALS = [
  { id: 'Muskelaufbau',        emoji: '💪', title: 'Muskelaufbau',        desc: 'Ich möchte Muskeln aufbauen.'          },
  { id: 'Kraft steigern',      emoji: '🏋️', title: 'Kraft steigern',      desc: 'Ich möchte stärker werden.'            },
  { id: 'Fett verlieren',      emoji: '🔥', title: 'Fett verlieren',      desc: 'Ich möchte Körperfett verlieren.'      },
  { id: 'Allgemeine Fitness',  emoji: '❤️', title: 'Allgemeine Fitness',  desc: 'Ich möchte allgemein fitter werden.'   },
  { id: 'Athletische Leistung',emoji: '🏃', title: 'Athletische Leistung',desc: 'Ich möchte meine Leistung steigern.'   },
]

const WD_NAMES: { [k: string]: string } = { Mo: 'Montag', Di: 'Dienstag', Mi: 'Mittwoch', Do: 'Donnerstag', Fr: 'Freitag', Sa: 'Samstag', So: 'Sonntag' }

interface Props {
  mainGoal: string
  days: DayItem[]
  exercises: { [weekday: string]: ExerciseItem[] }
  restDays: string[]
  caloriesTraining: number
  caloriesRest: number
  cardioSessions: CardioItem[]
  loading: boolean
  onGoalChange: (goal: string) => void
  onSubmit: () => void
}

export function Step7GoalSummary({ mainGoal, days, exercises, restDays, caloriesTraining, caloriesRest, loading, onGoalChange, onSubmit }: Props) {
  const trainingCount = days.filter(d => !d.isRestDay).length
  const totalEx = Object.values(exercises).reduce((s, arr) => s + arr.length, 0)
  const restNames = restDays.map(d => WD_NAMES[d] || d).join(', ') || 'Keine'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Ziele & Start</h1>
        <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Lege dein Hauptziel fest und überprüfe deinen Plan.</p>
      </div>

      {/* Goal selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {GOALS.map(g => {
          const active = mainGoal === g.id
          return (
            <div key={g.id} onClick={() => onGoalChange(g.id)} style={{
              background: active ? '#1e1535' : '#1a1a1a',
              border: `1.5px solid ${active ? '#7c3aed' : '#2a2a2a'}`,
              borderRadius: 14, padding: 16,
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 26 }}>{g.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{g.title}</div>
                <div style={{ fontSize: 13, color: '#888' }}>{g.desc}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: active ? '#7c3aed' : 'transparent',
                border: `2px solid ${active ? '#7c3aed' : '#555'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {active && <Check size={12} color="#fff" strokeWidth={3} />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div style={{ background: '#1a1a1a', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Plan Zusammenfassung</div>
        {[
          { label: 'Trainingsplan',       value: `${trainingCount} Trainingstage pro Woche` },
          { label: 'Übungen',             value: `${totalEx} Übungen in deinem Plan`        },
          { label: 'Ruhetage',            value: restNames                                   },
          { label: 'Ø Kcal Trainingstag', value: `${caloriesTraining.toLocaleString()} kcal`},
          { label: 'Ø Kcal Ruhetag',      value: `${caloriesRest.toLocaleString()} kcal`    },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid #2a2a2a' : 'none' }}>
            <span style={{ fontSize: 14, color: '#888' }}>{row.label}</span>
            <span style={{ fontSize: 14, color: '#7c3aed', fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Success box */}
      <div style={{ background: '#0d2010', border: '1px solid #22c55e', borderRadius: 12, padding: 16, display: 'flex', gap: 12 }}>
        <CheckCircle size={22} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Dein Plan ist bereit!</div>
          <div style={{ fontSize: 13, color: '#888' }}>Du kannst alle Einstellungen später jederzeit anpassen.</div>
        </div>
      </div>

      <button className="btn-primary" onClick={onSubmit} disabled={loading}
        style={{ height: 56, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? <Spinner size={22} /> : 'Plan erstellen & starten 🚀'}
      </button>
    </div>
  )
}
