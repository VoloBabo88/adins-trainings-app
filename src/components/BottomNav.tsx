import { Dumbbell, TrendingUp, UtensilsCrossed, User, MoreHorizontal } from 'lucide-react'

type Tab = 'training' | 'fortschritt' | 'ernaehrung' | 'profil' | 'mehr'

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; icon: typeof Dumbbell; label: string }[] = [
  { id: 'training',     icon: Dumbbell,         label: 'Training'   },
  { id: 'fortschritt',  icon: TrendingUp,        label: 'Fortschritt'},
  { id: 'ernaehrung',   icon: UtensilsCrossed,   label: 'Ernährung'  },
  { id: 'profil',       icon: User,              label: 'Profil'     },
  { id: 'mehr',         icon: MoreHorizontal,    label: 'Mehr'       },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, height: 'calc(64px + env(safe-area-inset-bottom))',
      background: '#111', borderTop: '1px solid #222',
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(({ id, icon: Icon, label }) => (
        <button key={id} onClick={() => onChange(id)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3,
          color: active === id ? '#7c3aed' : '#555',
          transition: 'color 0.2s',
        }}>
          <Icon size={22} />
          <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
        </button>
      ))}
    </nav>
  )
}
