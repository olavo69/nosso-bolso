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

type GoalsContextValue = {
  goals: GoalRow[]
  loading: boolean
}

const GoalsContext = createContext<GoalsContextValue | null>(null)

export function GoalsProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [goals, setGoals] = useState<GoalRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGoals() {
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
    fetchGoals()
  }, [profile?.couple_id])

  const value = useMemo(() => ({ goals, loading }), [goals, loading])

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>
}

export function useGoals() {
  const ctx = useContext(GoalsContext)
  if (!ctx) {
    throw new Error('useGoals must be used within a GoalsProvider')
  }
  return ctx
}
