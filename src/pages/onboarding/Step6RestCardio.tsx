import { useState } from 'react'
import { Plus, Activity, Pencil, Trash2, Lightbulb, X } from 'lucide-react'

export interface CardioItem {
  id: string
  weekday: string
  durationMinutes: number
  label: string
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

interface Props {
  restDays: string[]
  cardioSessions: CardioItem[]
  onRestDaysChange: (days: string[]) => void
  onCardioChange: (sessions: CardioItem[]) => void
}

const inp: React.CSSProperties = {
  background: '#2a2a2a', border: '1px solid #333', borderRadius: 10,
  padding: '12px 16px', color: '#fff', width: '100%', fontFamily: 'inherit', fontSize: 15,
}

export function Step6RestCardio({ restDays, cardioSessions, onRestDaysChange, onCardioChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState<CardioItem>({ id: '', weekday: 'Mo', durationMinutes: 30, label: 'Cardio' })

  const toggleDay = (wd: string) =>
    onRestDaysChange(restDays.includes(wd) ? restDays.filter(d => d !== wd) : [...restDays, wd])

  const openAdd = () => { setForm({ id: Date.now().toString(), weekday: 'Mo', durationMinutes: 30, label: 'Cardio' }); setEditIndex(null); setModalOpen(true) }
  const openEdit = (i: number) => { setForm({ ...cardioSessions[i] }); setEditIndex(i); setModalOpen(true) }
  const deleteCardio = (i: number) => onCardioChange(cardioSessions.filter((_, idx) => idx !== i))
  const saveCardio = () => {
    const list = [...cardioSessions]
    if (editIndex !== null) list[editIndex] = form
    else list.push({ ...form, id: Date.now().toString() })
    onCardioChange(list)
    setModalOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Ruhetage & Cardio</h1>
        <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Lege deine Ruhetage fest und füge optional Cardio-Einheiten hinzu.</p>
      </div>

      {/* Rest days */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Ruhetage</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {WEEKDAYS.map(wd => (
            <button key={wd} onClick={() => toggleDay(wd)} style={{
              height: 44, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: restDays.includes(wd) ? '#7c3aed' : '#1e1e1e',
              color: restDays.includes(wd) ? '#fff' : '#888',
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
            }}>
              {wd}
            </button>
          ))}
        </div>
      </div>

      {/* Cardio */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Cardio (optional)</div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Füge Cardio-Einheiten hinzu, wenn du welche planst.</div>
        {cardioSessions.map((c, i) => (
          <div key={c.id} style={{ background: '#1e1e1e', borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'rgba(124,58,237,0.15)', borderRadius: 8, padding: 8 }}>
              <Activity size={18} color="#7c3aed" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{c.label} / {c.weekday}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{c.durationMinutes} Min</div>
            </div>
            <button onClick={() => openEdit(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4 }}><Pencil size={16} /></button>
            <button onClick={() => deleteCardio(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4 }}><Trash2 size={16} /></button>
          </div>
        ))}
        <button className="btn-outline" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Plus size={18} /> Cardio hinzufügen
        </button>
      </div>

      {/* Info box */}
      <div style={{ background: '#1a1a1e', border: '1px solid #3a2a6e', borderRadius: 12, padding: 16, display: 'flex', gap: 12 }}>
        <Lightbulb size={20} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Warum Cardio?</div>
          <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>
            Regelmäßiges Cardio verbessert deine Ausdauer, beschleunigt die Regeneration und unterstützt das Kaloriendefizit beim Abnehmen.
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 430 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Cardio {editIndex !== null ? 'bearbeiten' : 'hinzufügen'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: '#2a2a2a', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#888', display: 'flex' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Wochentag</label>
                <select value={form.weekday} onChange={e => setForm(f => ({ ...f, weekday: e.target.value }))} style={{ ...inp, appearance: 'none' as const }}>
                  {WEEKDAYS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Dauer (Minuten)</label>
                <input type="number" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Label (optional)</label>
                <input type="text" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Cardio" style={inp} />
              </div>
              <button className="btn-primary" onClick={saveCardio}>Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
