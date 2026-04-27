import { useState } from 'react'
import { Plus, Flame, Beef, Wheat, Droplet, Trash2, Dumbbell, ScanLine, Sparkles } from 'lucide-react'
import { MacroRing } from '../components/MacroRing'
import { Modal } from '../components/Modal'
import { Spinner } from '../components/Spinner'
import { BarcodeScannerModal } from '../components/BarcodeScannerModal'
import { AIFoodScannerModal } from '../components/AIFoodScannerModal'
import { useMeals } from '../hooks/useMeals'
import { useTodayWorkout } from '../hooks/useTodayWorkout'
import { Profile } from '../lib/supabase'
import { showToast } from '../components/Toast'
import { useTheme } from '../context/ThemeContext'

interface Props { userId: string; profile: Profile | null }
type SubTab = 'uebersicht' | 'training' | 'ruhetag'

const MEAL_TYPES = ['Frühstück', 'Mittagessen', 'Abendessen', 'Snack']
const MEAL_EMOJI: { [k: string]: string } = { Frühstück: '🥣', Mittagessen: '🍽️', Abendessen: '🌙', Snack: '🍎' }
const WD_MAP: { [k: number]: string } = { 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa', 0: 'So' }

function GoalSection({ label, cal, prot, carbs, fat }: { label: string; cal: number; prot: number; carbs: number; fat: number }) {
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{label}</div>
      {[
        { icon: <Flame size={15} color="#f97316" />, label: 'Kalorien',       value: `${cal} kcal`  },
        { icon: <Beef  size={15} color="#22c55e" />, label: 'Protein',        value: `${prot} g`    },
        { icon: <Wheat size={15} color="#eab308" />, label: 'Kohlenhydrate',  value: `${carbs} g`   },
        { icon: <Droplet size={15} color="var(--accent)"/>, label: 'Fett',    value: `${fat} g`     },
      ].map((row, i, arr) => (
        <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #2a2a2a' : 'none' }}>
          {row.icon}
          <span style={{ flex: 1, fontSize: 15, color: '#fff' }}>{row.label}</span>
          <span style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ErnährungPage({ userId, profile }: Props) {
  const { accent } = useTheme()
  const [subTab, setSubTab] = useState<SubTab>('uebersicht')
  const [modalOpen, setModalOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [aiScannerOpen, setAiScannerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const { meals, loading, addMeal, deleteMeal } = useMeals(userId, today)
  const [form, setForm] = useState({ mealType: 'Frühstück', name: '', calories: '', protein: '', carbs: '', fat: '' })

  const isFlexible = profile?.plan_type === 'flexible'
  const { todayLog, loading: logLoading } = useTodayWorkout(userId)

  const dayType = isFlexible
    ? todayLog === undefined || logLoading
      ? 'unknown'
      : todayLog === null
        ? 'unknown'
        : todayLog.completed ? 'training' : 'rest'
    : (profile?.rest_days?.includes(WD_MAP[new Date().getDay()]) ? 'rest' : 'training')

  const restDay = dayType === 'rest'
  const calGoal  = restDay ? (profile?.calorie_goal_rest ?? 2200) : (profile?.calorie_goal ?? 2800)
  const protGoal = restDay ? (profile?.protein_goal_rest ?? 160)  : (profile?.protein_goal ?? 180)
  const carbGoal = restDay ? (profile?.carbs_goal_rest   ?? 200)  : (profile?.carbs_goal   ?? 320)
  const fatGoal  = restDay ? (profile?.fat_goal_rest     ?? 70)   : (profile?.fat_goal     ?? 80)

  const totalCal   = meals.reduce((s, m) => s + m.calories, 0)
  const totalProt  = meals.reduce((s, m) => s + m.protein_g, 0)
  const totalCarbs = meals.reduce((s, m) => s + m.carbs_g, 0)
  const totalFat   = meals.reduce((s, m) => s + m.fat_g, 0)
  const pct = Math.min(totalCal / calGoal, 1)

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Bitte Namen eingeben', 'error'); return }
    setSaving(true)
    const res = await addMeal({
      date: today, meal_type: form.mealType, name: form.name,
      calories: Number(form.calories) || 0,
      protein_g: Number(form.protein) || 0,
      carbs_g:   Number(form.carbs)   || 0,
      fat_g:     Number(form.fat)     || 0,
    })
    setSaving(false)
    if (res?.error) showToast('Fehler beim Speichern', 'error')
    else {
      showToast('Mahlzeit hinzugefügt!', 'success')
      setModalOpen(false)
      setForm({ mealType: 'Frühstück', name: '', calories: '', protein: '', carbs: '', fat: '' })
    }
  }

  const openManualModal = () => {
    setForm({ mealType: 'Frühstück', name: '', calories: '', protein: '', carbs: '', fat: '' })
    setModalOpen(true)
  }

  const handleProductScanned = (data: { name: string; calories: number; protein: number; carbs: number; fat: number }) => {
    setScannerOpen(false)
    setForm({
      mealType: 'Snack',
      name: data.name,
      calories: String(data.calories),
      protein: String(data.protein),
      carbs: String(data.carbs),
      fat: String(data.fat),
    })
    setModalOpen(true)
  }

  const inpStyle: React.CSSProperties = { background: '#2a2a2a', border: '1px solid #333', borderRadius: 10, padding: '12px 16px', color: '#fff', width: '100%', fontFamily: 'inherit', fontSize: 15 }

  const TABS: { id: SubTab; label: string }[] = [
    { id: 'uebersicht', label: 'Übersicht'   },
    { id: 'training',   label: 'Trainingstag'},
    { id: 'ruhetag',    label: 'Ruhetag'     },
  ]

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 20, paddingBottom: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>Ernährung</h1>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setSubTab(t.id)} style={{
              background: subTab === t.id ? accent : 'transparent',
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
        {(loading || logLoading) && <Spinner />}

        {!loading && !logLoading && subTab === 'uebersicht' && (
          <>
            {isFlexible && dayType === 'unknown' && (
              <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 28, textAlign: 'center', marginBottom: 16 }}>
                <Dumbbell size={36} color="#555" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                  Wähle erst dein heutiges Training aus
                </div>
                <div style={{ fontSize: 14, color: '#888', lineHeight: 1.5 }}>
                  Gehe zum Training-Tab und wähle dein heutiges Workout, um deinen Kalorienbedarf zu sehen.
                </div>
              </div>
            )}

            {dayType !== 'unknown' && <>
              <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: accent, fontWeight: 700, marginBottom: 10 }}>
                  🔥 Heute — {restDay ? 'Ruhetag' : 'Trainingstag'}
                </div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Kalorien</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                  {totalCal.toLocaleString()} <span style={{ fontSize: 16, color: '#888', fontWeight: 400 }}>/ {calGoal.toLocaleString()} kcal</span>
                </div>
                <div style={{ background: '#2a2a2a', borderRadius: 4, height: 6, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${pct * 100}%`, height: '100%', background: pct >= 1 ? '#ef4444' : accent, borderRadius: 4, transition: 'width 0.4s' }} />
                </div>
                <div style={{ fontSize: 13, color: '#888' }}>{Math.max(0, calGoal - totalCal).toLocaleString()} kcal übrig</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                <MacroRing value={Math.round(totalProt)}  max={protGoal} color="#22c55e" label="Protein" unit="g" />
                <MacroRing value={Math.round(totalCarbs)} max={carbGoal} color="#eab308" label="Carbs"   unit="g" />
                <MacroRing value={Math.round(totalFat)}   max={fatGoal}  color={accent}  label="Fett"    unit="g" />
              </div>

              <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Deine Makros</div>
                {[
                  { icon: <Flame size={15} color="#f97316" />, label: 'Kalorien',      value: `${calGoal} kcal`  },
                  { icon: <Beef  size={15} color="#22c55e" />, label: 'Protein',       value: `${protGoal} g`    },
                  { icon: <Wheat size={15} color="#eab308" />, label: 'Kohlenhydrate', value: `${carbGoal} g`    },
                  { icon: <Droplet size={15} color={accent}/>, label: 'Fett',          value: `${fatGoal} g`     },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #2a2a2a' : 'none' }}>
                    {row.icon}
                    <span style={{ flex: 1, fontSize: 15, color: '#fff' }}>{row.label}</span>
                    <span style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </>}

            {/* Meals */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Deine Mahlzeiten</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => setAiScannerOpen(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent, padding: 4, display: 'flex', alignItems: 'center' }}
                    title="KI-Analyse"
                  >
                    <Sparkles size={20} />
                  </button>
                  <button
                    onClick={() => setScannerOpen(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent, padding: 4, display: 'flex', alignItems: 'center' }}
                    title="Barcode scannen"
                  >
                    <ScanLine size={20} />
                  </button>
                  <button onClick={openManualModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                    + Hinzufügen
                  </button>
                </div>
              </div>
              {meals.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#555', fontSize: 14 }}>Noch keine Mahlzeiten eingetragen.</div>
              )}
              {meals.map(meal => (
                <div key={meal.id} style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: '#2a2a2a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {MEAL_EMOJI[meal.meal_type || ''] || '🍽️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{meal.meal_type} · P:{meal.protein_g}g K:{meal.carbs_g}g F:{meal.fat_g}g</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{meal.calories} kcal</div>
                  <button onClick={async () => { const r = await deleteMeal(meal.id); if (r?.error) showToast('Löschen fehlgeschlagen', 'error') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {meals.length > 0 && (
                <button className="btn-outline" onClick={openManualModal}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                  <Plus size={18} /> Mahlzeit hinzufügen
                </button>
              )}
            </div>
          </>
        )}

        {!loading && !logLoading && subTab === 'training' && (
          <GoalSection label="Trainingstag Ziele"
            cal={profile?.calorie_goal ?? 2800} prot={profile?.protein_goal ?? 180}
            carbs={profile?.carbs_goal ?? 320} fat={profile?.fat_goal ?? 80} />
        )}

        {!loading && !logLoading && subTab === 'ruhetag' && (
          <GoalSection label="Ruhetag Ziele"
            cal={profile?.calorie_goal_rest ?? 2200} prot={profile?.protein_goal_rest ?? 160}
            carbs={profile?.carbs_goal_rest ?? 200} fat={profile?.fat_goal_rest ?? 70} />
        )}
      </div>

      {/* Barcode scanner */}
      {scannerOpen && (
        <BarcodeScannerModal
          onClose={() => setScannerOpen(false)}
          onProduct={handleProductScanned}
        />
      )}

      {/* AI food scanner */}
      {aiScannerOpen && (
        <AIFoodScannerModal
          onClose={() => setAiScannerOpen(false)}
          onProduct={handleProductScanned}
        />
      )}

      {/* Add meal modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Mahlzeit hinzufügen">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Mahlzeittyp</label>
            <select value={form.mealType} onChange={e => setForm(f => ({ ...f, mealType: e.target.value }))}
              style={{ ...inpStyle, appearance: 'none' as const }}>
              {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="z.B. Haferflocken mit Whey" style={inpStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Kalorien (kcal)</label>
            <input type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} style={inpStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {([
              { label: 'Protein (g)', key: 'protein' },
              { label: 'KH (g)',      key: 'carbs'   },
              { label: 'Fett (g)',    key: 'fat'     },
            ] as const).map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input type="number"
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ ...inpStyle, padding: '10px 12px', fontSize: 14 }} />
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Speichern…' : 'Mahlzeit speichern'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
