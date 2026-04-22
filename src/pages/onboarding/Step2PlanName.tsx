import { Calendar, Shuffle } from 'lucide-react'

interface Props {
  planName: string
  planDescription: string
  planType: 'fixed' | 'flexible'
  onChange: (field: 'planName' | 'planDescription', value: string) => void
  onPlanTypeChange: (type: 'fixed' | 'flexible') => void
}

const PLAN_TYPES = [
  {
    id: 'fixed' as const,
    icon: <Calendar size={22} color="#7c3aed" />,
    title: 'Fester Trainingsplan',
    desc: 'Feste Trainingstage pro Woche (z.B. Mo=Push, Di=Pull…)',
  },
  {
    id: 'flexible' as const,
    icon: <Shuffle size={22} color="#7c3aed" />,
    title: 'Flexibler Trainingsplan',
    desc: 'Du entscheidest täglich, was du trainierst.',
  },
]

export function Step2PlanName({ planName, planDescription, planType, onChange, onPlanTypeChange }: Props) {
  const inp: React.CSSProperties = {
    background: '#1e1e1e', border: '1px solid #333', borderRadius: 10,
    padding: '14px 16px', color: '#fff', fontSize: 16, width: '100%',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Dein Plan</h1>
        <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Gib deinem Plan einen Namen und wähle den Typ.</p>
      </div>

      {/* Plan type toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Plantyp</div>
        {PLAN_TYPES.map(pt => {
          const active = planType === pt.id
          return (
            <div key={pt.id} onClick={() => onPlanTypeChange(pt.id)} style={{
              background: active ? '#1e1535' : '#1a1a1a',
              border: `1.5px solid ${active ? '#7c3aed' : '#2a2a2a'}`,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ width: 40, height: 40, background: active ? 'rgba(124,58,237,0.2)' : '#2a2a2a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {pt.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{pt.title}</div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{pt.desc}</div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: active ? '#7c3aed' : 'transparent',
                border: `2px solid ${active ? '#7c3aed' : '#444'}`,
              }} />
            </div>
          )
        })}
      </div>

      <div>
        <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8, fontWeight: 600 }}>Name deines Trainingsplans</label>
        <input type="text" value={planName} onChange={e => onChange('planName', e.target.value)} placeholder="Mein Trainingsplan" style={inp} />
      </div>
      <div>
        <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8, fontWeight: 600 }}>Beschreibung (optional)</label>
        <textarea value={planDescription} onChange={e => onChange('planDescription', e.target.value)} rows={4}
          style={{ ...inp, resize: 'none', minHeight: 100 }} />
      </div>
    </div>
  )
}
