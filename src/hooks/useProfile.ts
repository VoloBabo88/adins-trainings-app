import { useEffect, useState, useCallback } from 'react'
import { supabase, Profile } from '../lib/supabase'

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!userId) { setProfile(null); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
    if (!error && data) setProfile(data)
    return { error }
  }

  return { profile, loading, refetch: fetchProfile, updateProfile }
}
