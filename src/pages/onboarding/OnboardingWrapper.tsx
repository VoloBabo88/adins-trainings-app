import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showToast } from '../../components/Toast'
import { Step1Welcome } from './Step1Welcome'
import { Step2PlanName } from './Step2PlanName'
import { Step3TrainingDays, DayItem } from './Step3TrainingDays'
import { Step4Exercises, ExerciseItem } from './Step4Exercises'
import { Step5CaloriesMacros } from './Step5CaloriesMacros'
import { Step6RestCardio, CardioItem } from './Step6RestCardio'
import { Step7GoalSummary } from './Step7GoalSummary'

interface Props { userId: string; onComplete: () => void }

const DEFAULT_DAYS: DayItem[] = [
  { id: '1', weekday: 'Mo', label: 'Push',             isRestDay: false },
  { id: '2', weekday: 'Di', label: 'Pull',             isRestDay: false },
  { id: '3', weekday: 'Mi', label: 'Beine',            isRestDay: false },
  { id: '4', weekday: 'Do', label: 'Schultern & Arme', isRestDay: false },
  { id: '5', weekday: 'Fr', label: 'Brust & Rücken',   isRestDay: false },
  { id: '6', weekday: 'Sa', label: 'Ganzkörper',       isRestDay: false },
  { id: '7', weekday: 'So', label: 'Ruhetag',          isRestDay: true  },
]

const DEFAULT_EXERCISES: { [wd: string]: ExerciseItem[] } = {
  Mo: [
    { id: 'e1',  name: 'Bankdrücken',       muscleGroup: 'Brust',    sets: 4, repsMin: 8,  repsMax: 12, note: '' },
    { id: 'e2',  name: 'Schrägbankdrücken', muscleGroup: 'Brust',    sets: 4, repsMin: 8,  repsMax: 12, note: '' },
    { id: 'e3',  name: 'Schulterdrücken',   muscleGroup: 'Schultern', sets: 3, repsMin: 8,  repsMax: 12, note: '' },
    { id: 'e4',  name: 'Seitheben',         muscleGroup: 'Schultern', sets: 3, repsMin: 12, repsMax: 15, note: '' },
    { id: 'e5',  name: 'Trizepsdrücken',    muscleGroup: 'Trizeps',  sets: 3, repsMin: 10, repsMax: 15, note: '' },
  ],
  Di: [
    { id: 'e6',  name: 'Klimmzüge',         muscleGroup: 'Rücken',   sets: 4, repsMin: 6,  repsMax: 10, note: '' },
    { id: 'e7',  name: 'Langhantelrudern',  muscleGroup: 'Rücken',   sets: 4, repsMin: 8,  repsMax: 12, note: '' },
    { id: 'e8',  name: 'Bizepscurls',       muscleGroup: 'Bizeps',   sets: 3, repsMin: 10, repsMax: 15, note: '' },
    { id: 'e9',  name: 'Face Pulls',        muscleGroup: 'Schultern', sets: 3, repsMin: 15, repsMax: 20, note: '' },
    { id: 'e10', name: 'Hammer Curls',      muscleGroup: 'Bizeps',   sets: 3, repsMin: 10, repsMax: 15, note: '' },
  ],
  Mi: [
    { id: 'e11', name: 'Kniebeuge',         muscleGroup: 'Beine',    sets: 4, repsMin: 6,  repsMax: 10, note: '' },
    { id: 'e12', name: 'Beinpresse',        muscleGroup: 'Beine',    sets: 4, repsMin: 10, repsMax: 15, note: '' },
    { id: 'e13', name: 'Rum. Kreuzheben',   muscleGroup: 'Beine',    sets: 3, repsMin: 8,  repsMax: 12, note: '' },
    { id: 'e14', name: 'Beinstrecker',      muscleGroup: 'Beine',    sets: 3, repsMin: 12, repsMax: 15, note: '' },
    { id: 'e15', name: 'Wadenheben',        muscleGroup: 'Beine',    sets: 4, repsMin: 15, repsMax: 20, note: '' },
  ],
}

// ── Nutrition calculation ─────────────────────────────────────────────────────

const ACTIVITY_MULTS: Record<string, number> = {
  wenig: 1.2, leicht: 1.375, moderat: 1.55, sehr: 1.725, extrem: 1.9,
}

const GOAL_ADJ: Record<string, [number, number]> = {
  'Muskelaufbau':         [+300, -100],
  'Kraft steigern':       [+200, -100],
  'Fett verlieren':       [-500, -500],
  'Body Recomposition':   [-200, -400],
  'Allgemeine Fitness':   [0,    0   ],
  'Athletische Leistung': [+400, 0   ],
  'Erhalt':               [0,    0   ],
}

interface OData {
  planName: string; planDescription: string; planType: 'fixed' | 'flexible'
  trainingDays: DayItem[]; exercises: { [wd: string]: ExerciseItem[] }
  weight: number; height: number; age: number; sex: 'male' | 'female'; activityLevel: string
  caloriesTraining: number; proteinTraining: number; carbsTraining: number; fatTraining: number
  caloriesRest: number; proteinRest: number; carbsRest: number; fatRest: number
  restDays: string[]; cardioSessions: CardioItem[]; mainGoal: string
}

function applyCalc(d: OData): OData {
  if (d.weight <= 0 || d.height <= 0 || d.age <= 0) return d
  const bmr = d.sex === 'male'
    ? 10 * d.weight + 6.25 * d.height - 5 * d.age + 5
    : 10 * d.weight + 6.25 * d.height - 5 * d.age - 161
  const tdee = Math.round(bmr * (ACTIVITY_MULTS[d.activityLevel] ?? 1.55))
  const [trainAdj, restAdj] = GOAL_ADJ[d.mainGoal] ?? [0, 0]
  const calTrain = Math.max(1200, tdee + trainAdj)
  const calRest  = Math.max(1200, tdee + restAdj)
  const protein = Math.round(d.weight * 2)
  const fat = Math.round((calTrain * 0.25) / 9)
  const carbsTrain = Math.max(0, Math.round((calTrain - protein * 4 - fat * 9) / 4))
  const carbsRest  = Math.max(0, Math.round((calRest  - protein * 4 - fat * 9) / 4))
  return {
    ...d,
    caloriesTraining: calTrain, proteinTraining: protein, carbsTraining: carbsTrain, fatTraining: fat,
    caloriesRest: calRest,     proteinRest: protein,     carbsRest: carbsRest,       fatRest: fat,
  }
}

const INITIAL_DATA: OData = applyCalc({
  planName: 'Mein Trainingsplan', planDescription: '', planType: 'fixed',
  trainingDays: DEFAULT_DAYS, exercises: DEFAULT_EXERCISES,
  weight: 80, height: 180, age: 25, sex: 'male', activityLevel: 'moderat',
  caloriesTraining: 0, proteinTraining: 0, carbsTraining: 0, fatTraining: 0,
  caloriesRest: 0,     proteinRest: 0,     carbsRest: 0,     fatRest: 0,
  restDays: ['Sa', 'So'], cardioSessions: [], mainGoal: 'Muskelaufbau',
})

// ─────────────────────────────────────────────────────────────────────────────

export function OnboardingWrapper({ userId, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OData>(INITIAL_DATA)

  const set = <K extends keyof OData>(field: K, value: OData[K]) =>
    setData(prev => ({ ...prev, [field]: value }))

  const handleBodyChange = (field: string, value: number | string) =>
    setData(d => applyCalc({ ...d, [field]: value } as OData))

  const handleGoalChange = (goal: string) =>
    setData(d => applyCalc({ ...d, mainGoal: goal }))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      // 1. Save profile settings. Try with plan_type first; fall back without it
      //    in case the column hasn't been added to the DB yet.
      const settings = {
        main_goal: data.mainGoal, plan_type: data.planType, rest_days: data.restDays,
        calorie_goal: data.caloriesTraining, protein_goal: data.proteinTraining,
        carbs_goal: data.carbsTraining, fat_goal: data.fatTraining,
        calorie_goal_rest: data.caloriesRest, protein_goal_rest: data.proteinRest,
        carbs_goal_rest: data.carbsRest, fat_goal_rest: data.fatRest,
      }
      const { error: settingsErr } = await supabase.from('profiles').update(settings).eq('id', userId)
      if (settingsErr) {
        // Retry without plan_type (column may not exist yet)
        const { plan_type: _pt, ...settingsWithoutPlanType } = settings
        const { error: retryErr } = await supabase.from('profiles').update(settingsWithoutPlanType).eq('id', userId)
        if (retryErr) throw new Error('Profil-Einstellungen konnten nicht gespeichert werden.')
      }

      // 2. Create training plan
      const { data: plan, error: planErr } = await supabase
        .from('training_plans')
        .insert({ user_id: userId, name: data.planName, description: data.planDescription })
        .select().single()
      if (planErr) throw planErr

      // 3. Create training days
      const { data: savedDays, error: daysErr } = await supabase
        .from('training_days')
        .insert(data.trainingDays.map((d, i) => ({
          plan_id: plan.id, user_id: userId,
          weekday: d.weekday, label: d.label, is_rest_day: d.isRestDay, sort_order: i,
        })))
        .select()
      if (daysErr) throw daysErr

      // 4. Create exercises per day
      for (const day of savedDays || []) {
        const exs = data.exercises[day.weekday] || []
        if (exs.length > 0) {
          await supabase.from('plan_exercises').insert(
            exs.map((e, i) => ({
              day_id: day.id, user_id: userId,
              name: e.name, muscle_group: e.muscleGroup,
              sets: e.sets, reps_min: e.repsMin, reps_max: e.repsMax,
              note: e.note, sort_order: i,
            }))
          )
        }
      }

      // 5. Create cardio sessions
      if (data.cardioSessions.length > 0) {
        await supabase.from('cardio_sessions').insert(
          data.cardioSessions.map(c => ({
            user_id: userId, weekday: c.weekday,
            duration_minutes: c.durationMinutes, label: c.label,
          }))
        )
      }

      // 6. Mark onboarding done — this is the final gate that unlocks the main app.
      //    It is intentionally last so the app only advances once everything is saved.
      const { error: doneErr } = await supabase
        .from('profiles')
        .update({ onboarding_done: true })
        .eq('id', userId)
      if (doneErr) throw new Error('Onboarding konnte nicht abgeschlossen werden.')

      showToast('Plan erfolgreich erstellt!', 'success')
      onComplete()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Fehler beim Speichern. Bitte versuche es erneut.', 'error')
    }
    setSaving(false)
  }

  if (step === 0) return <Step1Welcome onNext={() => setStep(1)} />

  const TOTAL = 6

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Progress bar */}
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex' }}>
            <ChevronLeft size={24} />
          </button>
        )}
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < step ? '#7c3aed' : '#2a2a2a', transition: 'background 0.3s' }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: '#888', minWidth: 36, textAlign: 'right' }}>{step}/{TOTAL}</span>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        {step === 1 && (
          <Step2PlanName planName={data.planName} planDescription={data.planDescription} planType={data.planType}
            onChange={(f, v) => set(f as keyof OData, v as never)}
            onPlanTypeChange={type => set('planType', type)} />
        )}
        {step === 2 && (
          <Step3TrainingDays days={data.trainingDays} onChange={days => set('trainingDays', days)} />
        )}
        {step === 3 && (
          <Step4Exercises
            days={data.trainingDays} exercises={data.exercises}
            onChange={(wd, exs) => set('exercises', { ...data.exercises, [wd]: exs })}
          />
        )}
        {step === 4 && (
          <Step5CaloriesMacros
            weight={data.weight} height={data.height} age={data.age}
            sex={data.sex} activityLevel={data.activityLevel} mainGoal={data.mainGoal}
            caloriesTraining={data.caloriesTraining} proteinTraining={data.proteinTraining}
            carbsTraining={data.carbsTraining} fatTraining={data.fatTraining}
            caloriesRest={data.caloriesRest} proteinRest={data.proteinRest}
            carbsRest={data.carbsRest} fatRest={data.fatRest}
            onBodyChange={handleBodyChange}
            onChange={(field, value) => set(field as keyof OData, value as never)}
          />
        )}
        {step === 5 && (
          <Step6RestCardio
            restDays={data.restDays} cardioSessions={data.cardioSessions}
            onRestDaysChange={days => set('restDays', days)}
            onCardioChange={sessions => set('cardioSessions', sessions)}
          />
        )}
        {step === 6 && (
          <Step7GoalSummary
            mainGoal={data.mainGoal} days={data.trainingDays} exercises={data.exercises}
            restDays={data.restDays} caloriesTraining={data.caloriesTraining}
            caloriesRest={data.caloriesRest} cardioSessions={data.cardioSessions}
            loading={saving} onGoalChange={handleGoalChange} onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Next button — only steps 1–5 */}
      {step < 6 && (
        <div style={{ padding: '16px 20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
          <button className="btn-primary" onClick={() => setStep(s => s + 1)} style={{ height: 56, fontSize: 17 }}>
            Weiter →
          </button>
        </div>
      )}
    </div>
  )
}
