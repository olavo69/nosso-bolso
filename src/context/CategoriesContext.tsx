import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import type { CategoryRow } from '../types/db'
import { useAuth } from './AuthContext'

type CategoriesContextValue = {
  categories: CategoryRow[]
  loading: boolean
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      if (!supabase || !profile?.couple_id) {
        setCategories([])
        setLoading(false)
        return
      }
      setLoading(true)
      const { data } = await supabase.from('categories').select('*').order('nome')
      setCategories(data ?? [])
      setLoading(false)
    }
    fetchCategories()
  }, [profile?.couple_id])

  const value = useMemo(() => ({ categories, loading }), [categories, loading])

  return (
    <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) {
    throw new Error('useCategories must be used within a CategoriesProvider')
  }
  return ctx
}
