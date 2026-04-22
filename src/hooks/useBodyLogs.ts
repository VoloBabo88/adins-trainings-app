import { useEffect, useState, useCallback } from 'react'
import { supabase, BodyLog } from '../lib/supabase'

export function useBodyLogs(userId: string | undefined) {
  const [logs, setLogs] = useState<BodyLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    const { data } = await supabase
      .from('body_logs').select('*').eq('user_id', userId).order('date', { ascending: true })
    setLogs(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const addLog = async (log: Omit<BodyLog, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('body_logs').insert({ ...log, user_id: userId }).select().single()
    if (!error && data) setLogs(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
    return { error }
  }

  return { logs, loading, refetch: fetchLogs, addLog }
}
