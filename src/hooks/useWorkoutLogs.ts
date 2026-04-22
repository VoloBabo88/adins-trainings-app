import { useEffect, useState, useCallback } from 'react'
import { supabase, WorkoutLog } from '../lib/supabase'

export function useWorkoutLogs(userId: string | undefined) {
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    const { data } = await supabase
      .from('workout_logs').select('*').eq('user_id', userId).order('date', { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return { logs, loading, refetch: fetchLogs }
}
