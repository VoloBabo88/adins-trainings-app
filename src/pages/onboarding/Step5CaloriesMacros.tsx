interface Props {
  caloriesTraining: number; proteinTraining: number; carbsTraining: number; fatTraining: number
  caloriesRest: number; proteinRest: number; carbsRest: number; fatRest: number
  onChange: (field: string, value: number) => void
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
        <MacroInput color="#22c55e" label="Protein" value={p} onChange={v => onChange(pKey, v)} />
        <MacroInput color="#eab308" label="Kohlenhydrate" value={c} onChange={v => onChange(cKey, v)} />
        <MacroInput color="#7c3aed" label="Fett" value={f} onChange={v => onChange(fKey, v)} />
      </div>
    </div>
  )
}

export function Step5CaloriesMacros({ caloriesTraining, proteinTraining, carbsTraining, fatTraining, caloriesRest, proteinRest, carbsRest, fatRest, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Kalorien & Makros</h1>
        <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Lege deine Kalorien und Makros für Trainings- und Ruhetage fest.</p>
      </div>
      <Section title="Trainingstag" calKey="caloriesTraining" pKey="proteinTraining" cKey="carbsTraining" fKey="fatTraining"
        cal={caloriesTraining} p={proteinTraining} c={carbsTraining} f={fatTraining} onChange={onChange} />
      <div style={{ height: 1, background: '#2a2a2a' }} />
      <Section title="Ruhetag" calKey="caloriesRest" pKey="proteinRest" cKey="carbsRest" fKey="fatRest"
        cal={caloriesRest} p={proteinRest} c={carbsRest} f={fatRest} onChange={onChange} />
    </div>
  )
}
