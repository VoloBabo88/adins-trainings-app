import { useState } from 'react'
import { Settings, Bell, Ruler, Globe, Database, RefreshCw, Download, HelpCircle, Mail, Info, ChevronRight, Dumbbell, Palette, Check } from 'lucide-react'
import { Modal } from '../components/Modal'
import { Profile } from '../lib/supabase'
import { showToast } from '../components/Toast'
import { useTheme, ACCENT_OPTIONS } from '../context/ThemeContext'

interface Props {
  profile: Profile | null
  onUpdateProfile: (updates: Partial<Profile>) => Promise<{ error: unknown } | undefined>
}

export function MehrPage({ profile, onUpdateProfile }: Props) {
  const { accent, setAccent } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aboutOpen,    setAboutOpen]    = useState(false)
  const [appName, setAppName] = useState(profile?.app_name || 'TRAININGS APP')

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify({ profile, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' })
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'adins-trainings-export.json' })
      a.click(); URL.revokeObjectURL(a.href)
      showToast('Daten exportiert!', 'success')
    } catch { showToast('Export fehlgeschlagen', 'error') }
  }

  const saveSettings = async () => {
    const r = await onUpdateProfile({ app_name: appName })
    if (r?.error) showToast('Fehler', 'error')
    else { showToast('Gespeichert!', 'success'); setSettingsOpen(false) }
  }

  const handleAccentChange = async (color: string) => {
    setAccent(color)
    await onUpdateProfile({ accent_color: color })
  }

  const inp: React.CSSProperties = { background: '#2a2a2a', border: '1px solid #333', borderRadius: 10, padding: '12px 16px', color: '#fff', width: '100%', fontFamily: 'inherit', fontSize: 15 }

  const Item = ({ icon, label, right, onClick }: { icon: React.ReactNode; label: string; right?: React.ReactNode; onClick: () => void }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 16px', cursor: 'pointer', borderBottom: '1px solid #222' }}>
      <div style={{ width: 36, height: 36, background: '#2a2a2a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: 15, color: '#fff', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13 }}>
        {right}<ChevronRight size={16} color="#333" />
      </div>
    </div>
  )

  const SectionLabel = ({ label }: { label: string }) => (
    <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1, fontWeight: 600, margin: '24px 0 8px 4px' }}>
      {label}
    </div>
  )

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>Mehr</h1>
      </div>

      <div className="page-content" style={{ paddingTop: 8 }}>
        <SectionLabel label="Allgemein" />
        <div style={{ background: '#1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
          <Item icon={<Settings size={18}/>} label="Einstellungen"      onClick={() => setSettingsOpen(true)} />
          <Item icon={<Bell size={18}/>}     label="Benachrichtigungen"  onClick={() => showToast('Kommt bald!', 'success')} />
          <Item icon={<Ruler size={18}/>}    label="Einheiten"  right={<span>kg / cm</span>} onClick={() => showToast('Kommt bald!', 'success')} />
          <Item icon={<Globe size={18}/>}    label="Sprache"    right={<span>Deutsch</span>}  onClick={() => showToast('Kommt bald!', 'success')} />
        </div>

        <SectionLabel label="Design" />
        <div style={{ background: '#1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
          <div onClick={() => setSettingsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', cursor: 'pointer', borderBottom: '1px solid #222' }}>
            <div style={{ width: 36, height: 36, background: '#2a2a2a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', flexShrink: 0 }}>
              <Palette size={18} />
            </div>
            <span style={{ flex: 1, fontSize: 15, color: '#fff', fontWeight: 500 }}>Akzentfarbe</span>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: accent, flexShrink: 0 }} />
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Wähle deine Lieblingsfarbe</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {ACCENT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAccentChange(opt.value)}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', background: opt.value,
                    border: `3px solid ${accent === opt.value ? '#fff' : 'transparent'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.15s', flexShrink: 0,
                    boxShadow: accent === opt.value ? `0 0 0 1px ${opt.value}` : 'none',
                  }}
                >
                  {accent === opt.value && <Check size={18} color="#fff" strokeWidth={3} />}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {ACCENT_OPTIONS.map(opt => (
                <span key={opt.value} style={{ fontSize: 10, color: accent === opt.value ? '#fff' : '#555', fontWeight: accent === opt.value ? 700 : 400, flex: 1, textAlign: 'center' }}>
                  {opt.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <SectionLabel label="Daten" />
        <div style={{ background: '#1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
          <Item icon={<Database size={18}/>}   label="Daten sichern"        onClick={() => showToast('Automatisch in Supabase gesichert!', 'success')} />
          <Item icon={<RefreshCw size={18}/>}  label="Daten wiederherstellen" onClick={() => showToast('Daten werden automatisch geladen!', 'success')} />
          <Item icon={<Download size={18}/>}   label="Daten exportieren"    onClick={handleExport} />
        </div>

        <SectionLabel label="Support" />
        <div style={{ background: '#1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
          <Item icon={<HelpCircle size={18}/>} label="Hilfe & FAQ"    onClick={() => showToast('FAQ kommt bald!', 'success')} />
          <Item icon={<Mail size={18}/>}       label="Kontakt"         onClick={() => showToast('adinm218@gmail.com', 'success')} />
          <Item icon={<Info size={18}/>}       label="Über diese App"  onClick={() => setAboutOpen(true)} />
        </div>
      </div>

      {/* Settings modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Einstellungen">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>App-Name</label>
            <input type="text" value={appName} onChange={e => setAppName(e.target.value)} style={inp} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #2a2a2a' }}>
            <div>
              <div style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: '#555' }}>Immer aktiv</div>
            </div>
            <div style={{ width: 48, height: 28, borderRadius: 14, background: accent, opacity: 0.5, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: '#fff' }} />
            </div>
          </div>
          <button className="btn-primary" onClick={saveSettings}>Speichern</button>
        </div>
      </Modal>

      {/* About modal */}
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="Über diese App">
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ width: 72, height: 72, background: `linear-gradient(135deg,${accent},${accent}88)`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Dumbbell size={36} color="#fff" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{profile?.app_name || 'TRAININGS APP'}</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Version 1.0.0</div>
          {[
            { label: 'Entwickelt von', value: 'Adin'          },
            { label: 'Backend',        value: 'Supabase'      },
            { label: 'Frontend',       value: 'React + Vite'  },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2a2a2a' }}>
              <span style={{ fontSize: 14, color: '#888' }}>{row.label}</span>
              <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
          <button className="btn-primary" onClick={() => setAboutOpen(false)} style={{ marginTop: 24 }}>Schließen</button>
        </div>
      </Modal>
    </div>
  )
}
