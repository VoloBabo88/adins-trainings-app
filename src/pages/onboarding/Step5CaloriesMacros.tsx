import { useMemo } from 'react'
import { Info } from 'lucide-react'

const ACTIVITY_LEVELS = [
  { id: 'wenig',   label: 'Wenig aktiv',   desc: 'Bürojob, kaum Bewegung, kein Sport',       mult: 1.2   },
  { id: 'leicht',  label: 'Leicht aktiv',  desc: '1–2× Sport pro Woche, meist sitzend',      mult: 1.375 },
  { id: 'moderat', label: 'Moderat aktiv', desc: '3–4× Sport pro Woche, gelegentlich aktiv', mult: 1.55  },
  { id: 'sehr',    label: 'Sehr aktiv',    desc: '5–6× intensiver Sport pro Woche',          mult: 1.725 },
  { id: 'extrem',  label: 'Extrem aktiv',  desc: 'Tägliches Training, körperliche Arbeit',   mult: 1.9   },
]

const GOAL_ADJ: Record<string, [number, number]> = {
  'Muskelaufbau':         [+300, -100],
  'Kraft steigern':       [+200, -100],
  'Fett verlieren':       [-500, -500],
  'Body Recomposition':   [-200, -400],
  'Allgemeine Fitness':   [0,    0   ],
  'Athletische Leistung': [+400, 0   ],
  'Erhalt':               [0,    0   ],
}

const GOAL_NOTES: Record<string, string> = {
  'Muskelaufbau':         'Kalorienüberschuss an Trainingstagen fördert Muskelwachstum, leichtes Defizit an Ruhetagen minimiert Fettzunahme.',
  'Kraft steigern':       'Moderater Überschuss liefert Energie für intensive Krafteinheiten ohne übermäßige Fettzunahme.',
  'Fett verlieren':       'Konstantes Defizit von 500 kcal führt zu ca. 0,5 kg Fettverlust pro Woche.',
  'Body Recomposition':   'Leichtes Defizit ermöglicht gleichzeitigen Muskelaufbau und Fettabbau – ideal für Fortgeschrittene.',
  'Allgemeine Fitness':   'Erhaltungskalorien halten dein Gewicht stabil und versorgen dich mit ausreichend Energie.',
  'Athletische Leistung': 'Hoher Überschuss an Trainingstagen deckt den erhöhten Energiebedarf intensiver Einheiten.',
  'Erhalt':               'Erhaltungskalorien halten dein Gewicht stabil und versorgen dich optimal.',
}

interface Props {
  weight: number; height: number; age: number; sex: 'male' | 'female'
  activityLevel: string; mainGoal: string
  caloriesTraining: number; proteinTraining: number; carbsTraining: number; fatTraining: number
  caloriesRest: number; proteinRest: number; carbsRest: number; fatRest: number
  onBodyChange: (field: string, value: number | string) => void
  onChange: (field: string, value: number) => void
}

function NumInput({ label, value, unit, onChange }: { label: string; value: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{label}</div>
      <div style={{ background: '#2a2a2a', border: '1px solid #333', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="number" value={value || ''}
          onChange={e => onChange(Number(e.target.value))}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, width: '100%', padding: 0, fontFamily: 'inherit', outline: 'none' }}
        />
        <span style={{ fontSize: 12, color: '#888', flexShrink: 0 }}>{unit}</span>
      </div>
    </div>
  )
}

function MacroInput({ color, label, value, onChange }: { color: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ flex: 1, background: '#1e1e1e', borderRadius: 10, padding: 12, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, width: '100%', padding: 0, fontFamily: 'inherit', outline: 'none' }} />
        <span style={{ fontSize: 12, color: '#888' }}>g</span>
      </div>
    </div>
  )
}

function Section({ title, calKey, pKey, cKey, fKey, cal, p, c, f, onChange }: {
  title: string; calKey: string; pKey: string; cKey: string; fKey: string
  cal: number; p: number; c: number; f: number
  onChange: (field: string, v: number) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{title}</div>
      <div style={{ background: '#1e1e1e', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Kalorien</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="number" value={cal} onChange={e => onChange(calKey, Number(e.target.value))}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 26, fontWeight: 800, flex: 1, padding: 0, fontFamily: 'inherit', outline: 'none' }} />
          <span style={{ fontSize: 15, color: '#888' }}>kcal</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <MacroInput color="#22c55e" label="Protein"        value={p} onChange={v => onChange(pKey, v)} />
        <MacroInput color="#eab308" label="Kohlenhydrate"  value={c} onChange={v => onChange(cKey, v)} />
        <MacroInput color="#7c3aed" label="Fett"           value={f} onChange={v => onChange(fKey, v)} />
      </div>
    </div>
  )
}

export function Step5CaloriesMacros({
  weight, height, age, sex, activityLevel, mainGoal,
  caloriesTraining, proteinTraining, carbsTraining, fatTraining,
  caloriesRest, proteinRest, carbsRest, fatRest,
  onBodyChange, onChange,
}: Props) {
  const tdee = useMemo(() => {
    if (weight <= 0 || height <= 0 || age <= 0) return null
    const bmr = sex === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161
    const mult = ACTIVITY_LEVELS.find(a => a.id === activityLevel)?.mult ?? 1.55
    return Math.round(bmr * mult)
  }, [weight, height, age, sex, activityLevel])

  const [trainAdj, restAdj] = GOAL_ADJ[mainGoal] ?? [0, 0]

  const adjLabel = (adj: number) => adj === 0 ? 'Erhalt' : `${adj > 0 ? '+' : ''}${adj} kcal`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Kalorien & Makros</h1>
        <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Gib deine Körperdaten ein für eine automatische Berechnung.</p>
      </div>

      {/* Body stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Körperdaten</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <NumInput label="Gewicht" value={weight} unit="kg" onChange={v => onBodyChange('weight', v)} />
          <NumInput label="Größe"   value={height} unit="cm" onChange={v => onBodyChange('height', v)} />
          <NumInput label="Alter"   value={age}    unit="J"  onChange={v => onBodyChange('age', v)}    />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Geschlecht</div>
          <div style={{ display: 'flex', background: '#2a2a2a', borderRadius: 10, padding: 4, gap: 4 }}>
            {(['male', 'female'] as const).map(v => (
              <button key={v} onClick={() => onBodyChange('sex', v)} style={{
                flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', borderRadius: 8,
                background: sex === v ? '#7c3aed' : 'transparent',
                color: sex === v ? '#fff' : '#888',
                fontWeight: 700, fontSize: 14, fontFamily: 'inherit', transition: 'all 0.2s',
              }}>
                {v === 'male' ? 'Männlich' : 'Weiblich'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity level */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Aktivitätslevel</div>
        {ACTIVITY_LEVELS.map(a => (
          <div key={a.id} onClick={() => onBodyChange('activityLevel', a.id)} style={{
            background: activityLevel === a.id ? '#1e1535' : '#1a1a1a',
            border: `1.5px solid ${activityLevel === a.id ? '#7c3aed' : '#2a2a2a'}`,
            borderRadius: 12, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              background: activityLevel === a.id ? '#7c3aed' : 'transparent',
              border: `2px solid ${activityLevel === a.id ? '#7c3aed' : '#444'}`,
              transition: 'all 0.15s',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{a.label}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{a.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary card */}
      {tdee !== null && (
        <div style={{ background: '#0f0c24', border: '1px solid #3a2a6a', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', marginBottom: 12 }}>Dein Kalorienbedarf</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #2a2050' }}>
            <span style={{ fontSize: 13, color: '#888' }}>Grundumsatz (TDEE)</span>
            <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>{tdee.toLocaleString()} kcal</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #2a2050' }}>
            <span style={{ fontSize: 13, color: '#888' }}>Trainingstag <span style={{ color: '#666' }}>({adjLabel(trainAdj)})</span></span>
            <span style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>{caloriesTraining.toLocaleString()} kcal</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #2a2050' }}>
            <span style={{ fontSize: 13, color: '#888' }}>Ruhetag <span style={{ color: '#666' }}>({adjLabel(restAdj)})</span></span>
            <span style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>{caloriesRest.toLocaleString()} kcal</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #2a2050' }}>
            <span style={{ fontSize: 13, color: '#888' }}>Protein&nbsp;·&nbsp;Carbs&nbsp;·&nbsp;Fett</span>
            <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>
              {proteinTraining}g&nbsp;·&nbsp;{carbsTraining}g&nbsp;·&nbsp;{fatTraining}g
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, background: '#1a1540', borderRadius: 10, padding: 10 }}>
            <Info size={14} color="#7c3aed" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: '#888', lineHeight: 1.55 }}>
              {GOAL_NOTES[mainGoal] ?? 'Werte basieren auf Mifflin-St Jeor + deinem Aktivitätslevel.'}
            </span>
          </div>
        </div>
      )}

      {/* Manual override */}
      <div style={{ height: 1, background: '#2a2a2a' }} />
      <div style={{ fontSize: 13, color: '#555' }}>Werte manuell anpassen:</div>

      <Section title="Trainingstag"
        calKey="caloriesTraining" pKey="proteinTraining" cKey="carbsTraining" fKey="fatTraining"
        cal={caloriesTraining} p={proteinTraining} c={carbsTraining} f={fatTraining}
        onChange={onChange}
      />
      <div style={{ height: 1, background: '#2a2a2a' }} />
      <Section title="Ruhetag"
        calKey="caloriesRest" pKey="proteinRest" cKey="carbsRest" fKey="fatRest"
        cal={caloriesRest} p={proteinRest} c={carbsRest} f={fatRest}
        onChange={onChange}
      />
    </div>
  )
}
