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

export type NewCategoryInput = Omit<
  CategoryRow,
  'id' | 'couple_id' | 'created_at' | 'deleted_at'
>

type CategoriesContextValue = {
  categories: CategoryRow[]
  loading: boolean
  addCategory: (input: NewCategoryInput) => Promise<CategoryRow>
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)

  async function refetch() {
    if (!supabase || !profile?.couple_id) {
      setCategories([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('deleted_at', null)
      .order('nome')
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.couple_id])

  async function addCategory(input: NewCategoryInput) {
    if (!supabase || !profile?.couple_id) throw new Error('Sem casal vinculado.')
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...input, couple_id: profile.couple_id })
      .select()
      .single()
    if (error) throw error
    await refetch()
    return data as CategoryRow
  }

  const value = useMemo(
    () => ({ categories, loading, addCategory }),
    [categories, loading, profile?.couple_id],
  )

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
