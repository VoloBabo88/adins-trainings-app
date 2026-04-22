import { useEffect, useState, useCallback } from 'react'
import { supabase, TrainingPlan, TrainingDay, PlanExercise, CardioSession } from '../lib/supabase'

export function useTrainingPlan(userId: string | undefined) {
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [days, setDays] = useState<TrainingDay[]>([])
  const [exercises, setExercises] = useState<{ [dayId: string]: PlanExercise[] }>({})
  const [cardioSessions, setCardioSessions] = useState<CardioSession[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlan = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)

    const { data: plans } = await supabase
      .from('training_plans').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(1)

    if (!plans || plans.length === 0) { setLoading(false); return }
    const p = plans[0]
    setPlan(p)

    const { data: daysData } = await supabase
      .from('training_days').select('*').eq('plan_id', p.id).order('sort_order')
    setDays(daysData || [])

    if (daysData && daysData.length > 0) {
      const { data: exData } = await supabase
        .from('plan_exercises').select('*').in('day_id', daysData.map(d => d.id)).order('sort_order')
      const exMap: { [dayId: string]: PlanExercise[] } = {}
      for (const ex of exData || []) {
        if (!exMap[ex.day_id]) exMap[ex.day_id] = []
        exMap[ex.day_id].push(ex)
      }
      setExercises(exMap)
    }

    const { data: cardio } = await supabase.from('cardio_sessions').select('*').eq('user_id', userId)
    setCardioSessions(cardio || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  return { plan, days, exercises, cardioSessions, loading, refetch: fetchPlan }
}
