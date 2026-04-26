import { useState } from 'react'
import { User, Dumbbell, BarChart2, Target, ChevronRight, LogOut, Clock, Calendar, Check, AlertTriangle } from 'lucide-react'
import { Modal } from '../components/Modal'
import { Profile } from '../lib/supabase'
import { showToast } from '../components/Toast'
import { useWorkoutLogs } from '../hooks/useWorkoutLogs'
import { useTheme } from '../context/ThemeContext'

interface Props {
  userId: string
  profile: Profile | null
  onSignOut: () => void
  onTabChange: (tab: 'fortschritt') => void
  onUpdateProfile: (updates: Partial<Profile>) => Promise<{ error: unknown } | undefined>
}

const GOALS = [
  { id: 'Muskelaufbau',         emoji: '💪', title: 'Muskelaufbau'         },
  { id: 'Kraft steigern',       emoji: '🏋️', title: 'Kraft steigern'       },
  { id: 'Fett verlieren',       emoji: '🔥', title: 'Fett verlieren'       },
  { id: 'Allgemeine Fitness',   emoji: '❤️', title: 'Allgemeine Fitness'   },
  { id: 'Athletische Leistung', emoji: '🏃', title: 'Athletische Leistung' },
]

export function ProfilPage({ userId, profile, onSignOut, onTabChange, onUpdateProfile }: Props) {
  const { accent } = useTheme()
  const { logs } = useWorkoutLogs(userId)
  const [editOpen, setEditOpen]         = useState(false)
  const [goalOpen, setGoalOpen]         = useState(false)
  const [signOutOpen, setSignOutOpen]   = useState(false)
  const [editName, setEditName]         = useState(profile?.username || '')
  const [editMotto, setEditMotto]       = useState(profile?.motto || '')
  const [selGoal, setSelGoal]           = useState(profile?.main_goal || 'Muskelaufbau')

  const initials = (profile?.username || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const completed = logs.filter(l => l.completed).length
  const totalMin  = logs.reduce((s, l) => s + (l.duration_minutes || 0), 0)
  const since     = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : '—'
  const weeks     = Math.max(1, Math.ceil((Date.now() - new Date(logs[logs.length - 1]?.created_at || Date.now()).getTime()) / (7 * 86400000)))
  const avgPerWk  = logs.length > 0 ? (completed / weeks).toFixed(1) : '0'
  const totalH    = Math.floor(totalMin / 60)
  const totalMRem = totalMin % 60

  const save = async (updates: Partial<Profile>, cb: () => void) => {
    const r = await onUpdateProfile(updates)
    if (r?.error) showToast('Fehler beim Speichern', 'error')
    else { showToast('Gespeichert!', 'success'); cb() }
  }

  const inp: React.CSSProperties = { background: '#2a2a2a', border: '1px solid #333', borderRadius: 10, padding: '12px 16px', color: '#fff', width: '100%', fontFamily: 'inherit', fontSize: 15 }

  const MenuItem = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 16px', cursor: 'pointer', borderBottom: '1px solid #222' }}>
      <div style={{ width: 36, height: 36, background: `${accent}1a`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: 15, color: '#fff', fontWeight: 500 }}>{label}</span>
      <ChevronRight size={18} color="#333" />
    </div>
  )

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>Profil</h1>
      </div>

      <div className="page-content" style={{ paddingTop: 24 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg,${accent},${accent}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{initials}</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{profile?.username || 'Nutzer'}</div>
          <div style={{ fontSize: 14, color: '#888' }}>{profile?.motto}</div>
        </div>

        {/* Menu */}
        <div style={{ background: '#1a1a1a', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          <MenuItem icon={<User size={18} />}     label="Persönliche Daten" onClick={() => { setEditName(profile?.username || ''); setEditMotto(profile?.motto || ''); setEditOpen(true) }} />
          <MenuItem icon={<Dumbbell size={18} />} label="Trainingsplan"     onClick={() => showToast('Trainingsplan-Editor folgt bald!', 'success')} />
          <MenuItem icon={<BarChart2 size={18}/>} label="Körperdaten"       onClick={() => onTabChange('fortschritt')} />
          <MenuItem icon={<Target size={18} />}   label="Ziele"             onClick={() => { setSelGoal(profile?.main_goal || 'Muskelaufbau'); setGoalOpen(true) }} />
        </div>

        {/* Stats */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>Statistik</div>
          <div style={{ background: '#1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
            {[
              { icon: <Clock size={18} />,    label: 'Mitglied seit',      value: since },
              { icon: <Dumbbell size={18} />, label: 'Trainings',          value: String(completed) },
              { icon: <Calendar size={18} />, label: 'Trainingszeit',      value: totalH > 0 ? `${totalH} h ${totalMRem} Min` : `${totalMRem} Min` },
              { icon: <BarChart2 size={18}/>, label: 'Ø pro Woche',        value: `${avgPerWk} Einheiten` },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid #222' : 'none' }}>
                <div style={{ color: '#555' }}>{s.icon}</div>
                <span style={{ flex: 1, fontSize: 14, color: '#888' }}>{s.label}</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <button onClick={() => setSignOutOpen(true)} style={{ width: '100%', background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 12, padding: 16, color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <LogOut size={18} /> Ausloggen
        </button>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Persönliche Daten">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Name</label>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Motto</label>
            <input type="text" value={editMotto} onChange={e => setEditMotto(e.target.value)} placeholder="Kämpfe für dein Ziel." style={inp} />
          </div>
          <button className="btn-primary" onClick={() => save({ username: editName, motto: editMotto }, () => setEditOpen(false))}>Speichern</button>
        </div>
      </Modal>

      {/* Goal modal */}
      <Modal open={goalOpen} onClose={() => setGoalOpen(false)} title="Hauptziel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GOALS.map(g => (
            <div key={g.id} onClick={() => setSelGoal(g.id)} style={{
              background: selGoal === g.id ? '#1e1535' : '#2a2a2a',
              border: `1.5px solid ${selGoal === g.id ? accent : 'transparent'}`,
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            }}>
              <span style={{ fontSize: 22 }}>{g.emoji}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#fff' }}>{g.title}</span>
              {selGoal === g.id && <Check size={18} color={accent} />}
            </div>
          ))}
          <button className="btn-primary" onClick={() => save({ main_goal: selGoal }, () => setGoalOpen(false))} style={{ marginTop: 8 }}>Speichern</button>
        </div>
      </Modal>

      {/* Sign-out confirmation */}
      <Modal open={signOutOpen} onClose={() => setSignOutOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0 16px' }}>
          <AlertTriangle size={36} color="#ef4444" />
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center' }}>Ausloggen?</div>
          <div style={{ fontSize: 14, color: '#888', textAlign: 'center' }}>Du wirst aus deinem Konto abgemeldet.</div>
          <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 8 }}>
            <button onClick={() => setSignOutOpen(false)} style={{ flex: 1, background: '#2a2a2a', border: 'none', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Abbrechen
            </button>
            <button onClick={onSignOut} style={{ flex: 1, background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 12, padding: 14, color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Ausloggen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
