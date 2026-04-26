import { useEffect, useState, useCallback } from 'react'
import { supabase, WorkoutLog } from '../lib/supabase'

export function useTodayWorkout(userId: string | undefined) {
  const today = new Date().toISOString().split('T')[0]
  const [todayLog, setTodayLog] = useState<WorkoutLog | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  const fetchLog = useCallback(async () => {
    if (!userId) { setTodayLog(null); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()
    setTodayLog(data ?? null)
    setLoading(false)
  }, [userId, today])

  useEffect(() => { fetchLog() }, [fetchLog])

  const selectDay = useCallback(async (
    label: string,
    isRestDay: boolean,
    trainingDayId: string,
  ) => {
    if (!userId) return
    const payload = {
      label,
      training_day_id: trainingDayId,
      completed: !isRestDay,
    }
    if (todayLog) {
      await supabase.from('workout_logs').update(payload).eq('id', todayLog.id)
    } else {
      await supabase.from('workout_logs').insert({ user_id: userId, date: today, ...payload })
    }
    await fetchLog()
  }, [userId, today, todayLog, fetchLog])

  return { todayLog, loading, selectDay, refetch: fetchLog }
}
