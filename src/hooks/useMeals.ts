import { useEffect, useState, useCallback } from 'react'
import { supabase, Meal } from '../lib/supabase'

export function useMeals(userId: string | undefined, date: string) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMeals = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    const { data } = await supabase
      .from('meals').select('*').eq('user_id', userId).eq('date', date).order('created_at')
    setMeals(data || [])
    setLoading(false)
  }, [userId, date])

  useEffect(() => { fetchMeals() }, [fetchMeals])

  const addMeal = async (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('meals').insert({ ...meal, user_id: userId }).select().single()
    if (!error && data) setMeals(prev => [...prev, data])
    return { error }
  }

  const deleteMeal = async (id: string) => {
    await supabase.from('meals').delete().eq('id', id)
    setMeals(prev => prev.filter(m => m.id !== id))
  }

  return { meals, loading, refetch: fetchMeals, addMeal, deleteMeal }
}
