import { TrainingDay } from '../lib/supabase'

interface WeekCalendarProps {
  days: TrainingDay[]
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

export function WeekCalendar({ days }: WeekCalendarProps) {
  const today = new Date()
  const weekDates = getWeekDates()

  return (
    <div style={{ background: '#1a1a1a', borderRadius: 16, padding: '16px 12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {weekDates.map((date, i) => {
          const wd = WEEKDAYS[i]
          const planDay = days.find(d => d.weekday === JS_DAY_TO_WD[date.getDay()])
          const isToday = date.toDateString() === today.toDateString()

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>{wd}</span>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: isToday ? '#7c3aed' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{date.getDate()}</span>
              </div>
              <span style={{
                fontSize: 9, textAlign: 'center', lineHeight: 1.2,
                color: planDay?.is_rest_day ? '#444' : '#7c3aed',
                fontWeight: 500, maxWidth: 40, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {planDay ? (planDay.is_rest_day ? 'Rest' : planDay.label) : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
