import { useState } from 'react'
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Modal } from '../../components/Modal'

export interface DayItem {
  id: string
  weekday: string
  label: string
  isRestDay: boolean
}

interface Props {
  days: DayItem[]
  onChange: (days: DayItem[]) => void
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const inp: React.CSSProperties = {
  background: '#2a2a2a', border: '1px solid #333', borderRadius: 10,
  padding: '12px 16px', color: '#fff', width: '100%', fontFamily: 'inherit', fontSize: 15,
}

function SortableDay({ day, onEdit, onDelete }: { day: DayItem; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: day.id })
  return (
    <div ref={setNodeRef} style={{
      transform: CSS.Transform.toString(transform), transition,
      background: '#1e1e1e', borderRadius: 12, padding: '14px 16px',
      marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#444', display: 'flex' }}>
        <GripVertical size={20} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', width: 28 }}>{day.weekday}</span>
      <span style={{ flex: 1, fontSize: 15, color: day.isRestDay ? '#555' : '#7c3aed', fontWeight: 600 }}>{day.label}</span>
      <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4 }}><Pencil size={17} /></button>
      <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4 }}><Trash2 size={17} /></button>
    </div>
  )
}

export function Step3TrainingDays({ days, onChange }: Props) {
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<DayItem>({ id: '', weekday: 'Mo', label: '', isRestDay: false })

  const openAdd = () => { setForm({ id: Date.now().toString(), weekday: 'Mo', label: '', isRestDay: false }); setEditIndex(null); setModalOpen(true) }
  const openEdit = (i: number) => { setForm({ ...days[i] }); setEditIndex(i); setModalOpen(true) }
  const deleteDay = (i: number) => onChange(days.filter((_, idx) => idx !== i))
  const saveDay = () => {
    const updated = [...days]
    if (editIndex !== null) updated[editIndex] = form
    else updated.push(form)
    onChange(updated)
    setModalOpen(false)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (active.id !== over?.id) {
      onChange(arrayMove(days, days.findIndex(d => d.id === active.id), days.findIndex(d => d.id === over?.id)))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Deine Trainingstage</h1>
        <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Erstelle deine Trainingstage. Du kannst sie später jederzeit bearbeiten.</p>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={days.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {days.map((day, i) => (
            <SortableDay key={day.id} day={day} onEdit={() => openEdit(i)} onDelete={() => deleteDay(i)} />
          ))}
        </SortableContext>
      </DndContext>

      <button className="btn-outline" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Plus size={18} /> Neuen Tag hinzufügen
      </button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editIndex !== null ? 'Tag bearbeiten' : 'Tag hinzufügen'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Wochentag</label>
            <select value={form.weekday} onChange={e => setForm(f => ({ ...f, weekday: e.target.value }))} style={{ ...inp, appearance: 'none' as const }}>
              {WEEKDAYS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Label</label>
            <input type="text" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="z.B. Push" style={inp} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>Ruhetag</span>
            <button onClick={() => setForm(f => ({ ...f, isRestDay: !f.isRestDay, label: !f.isRestDay ? 'Ruhetag' : '' }))}
              style={{ width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', background: form.isRestDay ? '#7c3aed' : '#333', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 4, left: form.isRestDay ? 24 : 4, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </button>
          </div>
          <button className="btn-primary" onClick={saveDay}>Speichern</button>
        </div>
      </Modal>
    </div>
  )
}
