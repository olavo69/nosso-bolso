import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import type { GoalRow } from '../types/db'
import { useAuth } from './AuthContext'

export type NewGoalInput = Omit<GoalRow, 'id' | 'couple_id' | 'created_at'>

type GoalsContextValue = {
  goals: GoalRow[]
  loading: boolean
  addGoal: (input: NewGoalInput) => Promise<GoalRow>
}

const GoalsContext = createContext<GoalsContextValue | null>(null)

export function GoalsProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [goals, setGoals] = useState<GoalRow[]>([])
  const [loading, setLoading] = useState(true)

  async function refetch() {
    if (!supabase || !profile?.couple_id) {
      setGoals([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('created_at')
    setGoals(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.couple_id])

  async function addGoal(input: NewGoalInput) {
    if (!supabase || !profile?.couple_id) throw new Error('Sem casal vinculado.')
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...input, couple_id: profile.couple_id })
      .select()
      .single()
    if (error) throw error
    await refetch()
    return data as GoalRow
  }

  const value = useMemo(
    () => ({ goals, loading, addGoal }),
    [goals, loading, profile?.couple_id],
  )

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>
}

export function useGoals() {
  const ctx = useContext(GoalsContext)
  if (!ctx) {
    throw new Error('useGoals must be used within a GoalsProvider')
  }
  return ctx
}
