import { TrainingDay, PlanExercise } from '../lib/supabase'
import { getMuscleIcon, detectPrimaryMuscle } from './MuscleIcons'
import { useTheme } from '../context/ThemeContext'

interface WeekCalendarProps {
  days: TrainingDay[]
  exercises?: { [dayId: string]: PlanExercise[] }
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const JS_DAY_TO_WD: { [k: number]: string } = { 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa', 0: 'So' }

function getWeekDates() {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
  return WEEKDAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function WeekCalendar({ days, exercises = {} }: WeekCalendarProps) {
  const { accent } = useTheme()
  const today = new Date()
  const weekDates = getWeekDates()

  return (
    <div style={{ background: '#1a1a1a', borderRadius: 16, padding: '16px 12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {weekDates.map((date, i) => {
          const wd = WEEKDAYS[i]
          const planDay = days.find(d => d.weekday === JS_DAY_TO_WD[date.getDay()])
          const isToday = date.toDateString() === today.toDateString()
          const dayExercises = planDay ? (exercises[planDay.id] || []) : []
          const muscle = planDay ? detectPrimaryMuscle(dayExercises, planDay.is_rest_day ? 'Ruhetag' : planDay.label) : null

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>{wd}</span>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: isToday ? accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{date.getDate()}</span>
              </div>
              <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: planDay ? 1 : 0.15 }}>
                {muscle
                  ? getMuscleIcon(muscle, 16, planDay?.is_rest_day ? '#444' : isToday ? accent : '#666')
                  : <span style={{ fontSize: 8, color: '#333' }}>—</span>
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
