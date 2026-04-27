import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  username: string | null
  motto: string
  app_name: string
  main_goal: string
  plan_type: 'fixed' | 'flexible'
  rest_days: string[]
  onboarding_done: boolean
  calorie_goal: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
  calorie_goal_rest: number
  protein_goal_rest: number
  carbs_goal_rest: number
  fat_goal_rest: number
  accent_color: string | null
  nutritionix_app_id: string | null
  nutritionix_app_key: string | null
  created_at: string
}

export type BodyLog = {
  id: string
  user_id: string
  date: string
  weight: number | null
  body_fat: number | null
  muscle_mass: number | null
  created_at: string
}

export type Meal = {
  id: string
  user_id: string
  date: string
  meal_type: string | null
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  created_at: string
}

export type TrainingPlan = {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
}

export type TrainingDay = {
  id: string
  plan_id: string
  user_id: string
  weekday: string
  label: string
  sort_order: number
  is_rest_day: boolean
  created_at: string
}

export type PlanExercise = {
  id: string
  day_id: string
  user_id: string
  name: string
  muscle_group: string | null
  sets: number
  reps_min: number
  reps_max: number
  note: string | null
  sort_order: number
  created_at: string
}

export type CardioSession = {
  id: string
  user_id: string
  weekday: string
  duration_minutes: number
  label: string
  created_at: string
}

export type WorkoutLog = {
  id: string
  user_id: string
  date: string
  training_day_id: string | null
  label: string | null
  duration_minutes: number | null
  completed: boolean
  created_at: string
}

export type WorkoutSet = {
  id: string
  workout_log_id: string
  user_id: string
  exercise_name: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  completed: boolean
  created_at: string
}
