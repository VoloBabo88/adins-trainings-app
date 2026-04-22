interface Props {
  planName: string
  planDescription: string
  onChange: (field: 'planName' | 'planDescription', value: string) => void
}

export function Step2PlanName({ planName, planDescription, onChange }: Props) {
  const inp: React.CSSProperties = {
    background: '#1e1e1e', border: '1px solid #333', borderRadius: 10,
    padding: '14px 16px', color: '#fff', fontSize: 16, width: '100%',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Dein Plan</h1>
        <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Gib deinem Plan einen Namen.</p>
      </div>
      <div>
        <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8, fontWeight: 600 }}>Name deines Trainingsplans</label>
        <input type="text" value={planName} onChange={e => onChange('planName', e.target.value)} placeholder="Mein Trainingsplan" style={inp} />
      </div>
      <div>
        <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8, fontWeight: 600 }}>Beschreibung (optional)</label>
        <textarea value={planDescription} onChange={e => onChange('planDescription', e.target.value)} rows={4}
          style={{ ...inp, resize: 'none', minHeight: 120 }} />
      </div>
    </div>
  )
}
