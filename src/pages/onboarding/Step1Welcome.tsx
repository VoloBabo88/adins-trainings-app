import { Dumbbell, Utensils, TrendingUp } from 'lucide-react'

export function Step1Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)',
      position: 'relative', display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end', padding: 32, overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'absolute', top: 64, left: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Dumbbell size={32} color="#7c3aed" />
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: 6, lineHeight: 1 }}>ADIN</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', letterSpacing: 3 }}>TRAININGS APP</div>
          </div>
        </div>
      </div>

      <div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>Willkommen!</h1>
        <p style={{ fontSize: 16, color: '#aaa', margin: '0 0 32px', lineHeight: 1.5 }}>
          Erstelle deinen persönlichen Trainingsplan und erreiche deine Ziele.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
          {[
            { icon: <Dumbbell size={22} color="#7c3aed" />, title: 'Dein Plan, deine Regeln', desc: 'Erstelle deinen kompletten Trainingsplan nach deinen Vorstellungen.' },
            { icon: <Utensils size={22} color="#7c3aed" />, title: 'Ernährung im Blick', desc: 'Lege deine Kalorien und Makros für Trainings- und Ruhetage fest.' },
            { icon: <TrendingUp size={22} color="#7c3aed" />, title: 'Fortschritt verfolgen', desc: 'Behalte deine Entwicklung im Auge und werde besser.' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(124,58,237,0.15)', borderRadius: 12, padding: 10, flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onNext} style={{
          background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 16,
          height: 56, fontSize: 17, fontWeight: 700, width: '100%',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Los geht's →
        </button>
      </div>
    </div>
  )
}
