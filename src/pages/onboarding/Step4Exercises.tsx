import { useState } from 'react'
import { GripVertical, Pencil, Trash2, Plus, Minus, X, ChevronDown } from 'lucide-react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DayItem } from './Step3TrainingDays'

export interface ExerciseItem {
  id: string
  name: string
  muscleGroup: string
  sets: number
  repsMin: number
  repsMax: number
  note: string
}

interface Props {
  days: DayItem[]
  exercises: { [weekday: string]: ExerciseItem[] }
  onChange: (weekday: string, exercises: ExerciseItem[]) => void
}

const MUSCLE_GROUPS = ['Brust', 'Rücken', 'Schultern', 'Bizeps', 'Trizeps', 'Beine', 'Gesäß', 'Core', 'Sonstiges']

const inp: React.CSSProperties = {
  background: '#2a2a2a', border: '1px solid #333', borderRadius: 10,
  padding: '12px 16px', color: '#fff', width: '100%',
  fontFamily: 'inherit', fontSize: 15, boxSizing: 'border-box',
}

function SortableExercise({ ex, onEdit, onDelete }: { ex: ExerciseItem; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: ex.id })
  return (
    <div ref={setNodeRef} style={{
      transform: CSS.Transform.toString(transform), transition,
      background: '#1e1e1e', borderRadius: 12, padding: '14px 16px',
      marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#444', display: 'flex' }}>
        <GripVertical size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{ex.name}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{ex.muscleGroup} · {ex.sets}×{ex.repsMin}–{ex.repsMax}</div>
      </div>
      <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4 }}><Pencil size={17} /></button>
      <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4 }}><Trash2 size={17} /></button>
    </div>
  )
}

function Stepper({ label, display, onDec, onInc }: { label: string; display: string; onDec: () => void; onInc: () => void }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onDec} style={{ width: 34, height: 34, borderRadius: '50%', background: '#2a2a2a', border: 'none', cursor: 'pointer', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={15} /></button>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', minWidth: 32, textAlign: 'center' }}>{display}</span>
        <button onClick={onInc} style={{ width: 34, height: 34, borderRadius: '50%', background: '#2a2a2a', border: 'none', cursor: 'pointer', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={15} /></button>
      </div>
    </div>
  )
}

const EMPTY = (): ExerciseItem => ({ id: Date.now().toString(), name: '', muscleGroup: 'Brust', sets: 3, repsMin: 8, repsMax: 12, note: '' })

export function Step4Exercises({ days, exercises, onChange }: Props) {
  const nonRest = days.filter(d => !d.isRestDay)
  const [selected, setSelected] = useState(nonRest[0]?.weekday || '')
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState<ExerciseItem>(EMPTY())

  const current = exercises[selected] || []

  const openAdd = () => { setForm(EMPTY()); setEditIndex(null); setModalOpen(true) }
  const openEdit = (i: number) => { setForm({ ...current[i] }); setEditIndex(i); setModalOpen(true) }
  const deleteEx = (i: number) => onChange(selected, current.filter((_, idx) => idx !== i))
  const saveEx = () => {
    const list = [...current]
    if (editIndex !== null) list[editIndex] = form
    else list.push({ ...form, id: Date.now().toString() })
    onChange(selected, list)
    setModalOpen(false)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (active.id !== over?.id) {
      onChange(selected, arrayMove(current, current.findIndex(ex => ex.id === active.id), current.findIndex(ex => ex.id === over?.id)))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Übungen hinzufügen</h1>
        <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Wähle einen Tag aus und füge die Übungen hinzu.</p>
      </div>

      {/* Day selector */}
      <div style={{ position: 'relative' }}>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          style={{ ...inp, paddingRight: 40, appearance: 'none' as const }}>
          {nonRest.map(d => <option key={d.weekday} value={d.weekday}>{d.weekday} – {d.label}</option>)}
        </select>
        <ChevronDown size={18} color="#7c3aed" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={current.map(e => e.id)} strategy={verticalListSortingStrategy}>
          {current.map((ex, i) => (
            <SortableExercise key={ex.id} ex={ex} onEdit={() => openEdit(i)} onDelete={() => deleteEx(i)} />
          ))}
        </SortableContext>
      </DndContext>

      {current.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#555', fontSize: 14 }}>
          Noch keine Übungen für diesen Tag.
        </div>
      )}

      <button className="btn-outline" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Plus size={18} /> Übung hinzufügen
      </button>

      {/* Modal */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 430, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{editIndex !== null ? 'Übung bearbeiten' : 'Übung hinzufügen'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: '#2a2a2a', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#888', display: 'flex' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Übungsname</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Latzug eng" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Muskelgruppe</label>
                <select value={form.muscleGroup} onChange={e => setForm(f => ({ ...f, muscleGroup: e.target.value }))} style={{ ...inp, appearance: 'none' as const }}>
                  {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <Stepper label="Sätze" display={String(form.sets)}
                  onDec={() => setForm(f => ({ ...f, sets: Math.max(1, f.sets - 1) }))}
                  onInc={() => setForm(f => ({ ...f, sets: f.sets + 1 }))} />
                <Stepper label="Wdh. Min" display={String(form.repsMin)}
                  onDec={() => setForm(f => ({ ...f, repsMin: Math.max(1, f.repsMin - 1) }))}
                  onInc={() => setForm(f => ({ ...f, repsMin: f.repsMin + 1 }))} />
                <Stepper label="Wdh. Max" display={String(form.repsMax)}
                  onDec={() => setForm(f => ({ ...f, repsMax: Math.max(f.repsMin, f.repsMax - 1) }))}
                  onInc={() => setForm(f => ({ ...f, repsMax: f.repsMax + 1 }))} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 8 }}>Notiz (optional)</label>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="z.B. Langsame Ausführung, volle Dehnung" rows={3}
                  style={{ ...inp, resize: 'none' }} />
              </div>
              <button className="btn-primary" onClick={saveEx}>Übung speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
