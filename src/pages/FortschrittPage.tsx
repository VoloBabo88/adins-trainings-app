import { useState } from 'react'
import { Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Modal } from '../components/Modal'
import { Spinner } from '../components/Spinner'
import { useBodyLogs } from '../hooks/useBodyLogs'
import { showToast } from '../components/Toast'

interface Props { userId: string }
type SubTab = 'uebersicht' | 'gewicht' | 'koerperfett' | 'fotos'

const fmt = (d: string) => new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>{payload[0].value}</div>
    </div>
  )
}

function ChartCard({ title, subtitle, data, color, height = 160 }: {
  title: string; subtitle: string; data: { date: string; value: number }[]; color: string; height?: number
}) {
  const chartData = data.map(d => ({ date: fmt(d.date), value: d.value }))
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>{subtitle}</div>
      {data.length < 2 ? (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
          Mindestens 2 Einträge für Diagramm nötig
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#555', fontSize: 11 }} tickLine={false} axisLine={false} orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function StatCard({ title, value, unit, diff, trendGoodWhenDown }: { title: string; value: string; unit: string; diff: number | null; trendGoodWhenDown: boolean }) {
  const good = diff === null ? null : trendGoodWhenDown ? diff < 0 : diff > 0
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
        {value} <span style={{ fontSize: 13, fontWeight: 400, color: '#888' }}>{unit}</span>
      </div>
      {diff !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {good ? <TrendingDown size={13} color="#22c55e" /> : <TrendingUp size={13} color="#ef4444" />}
          <span style={{ fontSize: 12, color: good ? '#22c55e' : '#ef4444' }}>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
          </span>
        </div>
      )}
      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>vs. letzter Eintrag</div>
    </div>
  )
}

export function FortschrittPage({ userId }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('uebersicht')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], weight: '', bodyFat: '', muscleMass: '' })
  const [saving, setSaving] = useState(false)
  const { logs, loading, addLog } = useBodyLogs(userId)

  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30)
  const recent = logs.filter(l => new Date(l.date) >= cutoff)
  const weightData = recent.filter(l => l.weight != null).map(l => ({ date: l.date, value: Number(l.weight) }))
  const fatData    = recent.filter(l => l.body_fat != null).map(l => ({ date: l.date, value: Number(l.body_fat) }))

  const last = logs[logs.length - 1]
  const prev = logs[logs.length - 2]
  const wDiff  = last?.weight     && prev?.weight     ? Number(last.weight)      - Number(prev.weight)     : null
  const fDiff  = last?.body_fat   && prev?.body_fat   ? Number(last.body_fat)    - Number(prev.body_fat)   : null
  const mDiff  = last?.muscle_mass && prev?.muscle_mass ? Number(last.muscle_mass) - Number(prev.muscle_mass) : null

  const handleSave = async () => {
    setSaving(true)
    const res = await addLog({
      date: form.date,
      weight:      form.weight    ? Number(form.weight)    : null,
      body_fat:    form.bodyFat   ? Number(form.bodyFat)   : null,
      muscle_mass: form.muscleMass? Number(form.muscleMass): null,
    })
    setSaving(false)
    if (res?.error) showToast('Fehler beim Speichern', 'error')
    else { showToast('Eintrag gespeichert!', 'success'); setModalOpen(false) }
  }

  const TABS: { id: SubTab; label: string }[] = [
    { id: 'uebersicht',  label: 'Übersicht'  },
    { id: 'gewicht',     label: 'Gewicht'    },
    { id: 'koerperfett', label: 'Körperfett' },
    { id: 'fotos',       label: 'Fotos'      },
  ]

  const inpStyle: React.CSSProperties = { background: '#2a2a2a', border: '1px solid #333', borderRadius: 10, padding: '12px 16px', color: '#fff', width: '100%', fontFamily: 'inherit', fontSize: 15 }

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 20, paddingBottom: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>Fortschritt</h1>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setSubTab(t.id)} style={{
              background: subTab === t.id ? '#7c3aed' : 'transparent',
              color: subTab === t.id ? '#fff' : '#888',
              border: 'none', borderRadius: 20, padding: '8px 18px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 20 }}>
        {loading && <Spinner />}

        {!loading && subTab === 'uebersicht' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              <StatCard title="Gewicht"     value={last?.weight      ? String(last.weight)      : '—'} unit="kg" diff={wDiff} trendGoodWhenDown={true}  />
              <StatCard title="Körperfett"  value={last?.body_fat    ? String(last.body_fat)    : '—'} unit="%" diff={fDiff} trendGoodWhenDown={true}  />
              <StatCard title="Muskelmasse" value={last?.muscle_mass ? String(last.muscle_mass) : '—'} unit="kg" diff={mDiff} trendGoodWhenDown={false} />
            </div>
            <ChartCard title="Gewichtsverlauf"    subtitle="Letzte 30 Tage" data={weightData} color="#7c3aed" />
            <ChartCard title="Körperfettverlauf"  subtitle="Letzte 30 Tage" data={fatData}    color="#ef4444" />
          </>
        )}

        {!loading && subTab === 'gewicht' && (
          <>
            <ChartCard title="Gewichtsverlauf" subtitle={`${logs.filter(l => l.weight).length} Einträge`}
              data={logs.filter(l => l.weight != null).map(l => ({ date: l.date, value: Number(l.weight) }))}
              color="#7c3aed" height={280} />
            <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Alle Einträge</div>
              {logs.filter(l => l.weight).map((l, i, arr) => {
                const p = arr[i - 1]
                const d = p?.weight && l.weight ? (Number(l.weight) - Number(p.weight)) : null
                return (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #2a2a2a' : 'none' }}>
                    <span style={{ fontSize: 14, color: '#888' }}>{fmt(l.date)}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{l.weight} kg</span>
                    {d !== null && <span style={{ fontSize: 12, color: d < 0 ? '#22c55e' : '#ef4444' }}>{d > 0 ? '+' : ''}{d.toFixed(1)}</span>}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {!loading && subTab === 'koerperfett' && (
          <>
            <ChartCard title="Körperfett" subtitle={`${logs.filter(l => l.body_fat).length} Einträge`}
              data={logs.filter(l => l.body_fat != null).map(l => ({ date: l.date, value: Number(l.body_fat) }))}
              color="#ef4444" height={280} />
            <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16 }}>
              {logs.filter(l => l.body_fat).map((l, i, arr) => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #2a2a2a' : 'none' }}>
                  <span style={{ fontSize: 14, color: '#888' }}>{fmt(l.date)}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{l.body_fat}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && subTab === 'fotos' && (
          <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📸</div>
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>Fortschrittsfotos</h3>
            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Diese Funktion kommt bald!</p>
          </div>
        )}

        {!loading && (
          <button className="btn-primary" onClick={() => setModalOpen(true)}
            style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <Plus size={20} /> Neuer Eintrag
          </button>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Neuer Eintrag">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {([
            { label: 'Datum',            key: 'date',       type: 'date'   },
            { label: 'Gewicht (kg)',      key: 'weight',     type: 'number' },
            { label: 'Körperfett (%)',    key: 'bodyFat',    type: 'number' },
            { label: 'Muskelmasse (kg)',  key: 'muscleMass', type: 'number' },
          ] as const).map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} step="0.1"
                value={(form as Record<string, string>)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={inpStyle} />
            </div>
          ))}
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
