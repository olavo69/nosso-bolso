import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import type { TransactionRow } from '../types/db'
import { useAuth } from './AuthContext'

export type NewTransactionInput = Omit<TransactionRow, 'id' | 'couple_id' | 'created_at'>

type TransactionsContextValue = {
  transactions: TransactionRow[]
  loading: boolean
  addTransactions: (rows: NewTransactionInput[]) => Promise<void>
  updateTransaction: (id: string, updates: Partial<NewTransactionInput>) => Promise<void>
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)

  async function refetch() {
    if (!supabase || !profile?.couple_id) {
      setTransactions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('data', { ascending: false })
    setTransactions(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.couple_id])

  async function addTransactions(rows: NewTransactionInput[]) {
    if (!supabase || !profile?.couple_id) return
    const withCouple = rows.map((r) => ({ ...r, couple_id: profile.couple_id }))
    const { error } = await supabase.from('transactions').insert(withCouple)
    if (error) throw error
    await refetch()
  }

  async function updateTransaction(id: string, updates: Partial<NewTransactionInput>) {
    if (!supabase) return
    const { error } = await supabase.from('transactions').update(updates).eq('id', id)
    if (error) throw error
    await refetch()
  }

  const value = useMemo(
    () => ({ transactions, loading, addTransactions, updateTransaction }),
    [transactions, loading, profile?.couple_id],
  )

  return (
    <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext)
  if (!ctx) {
    throw new Error('useTransactions must be used within a TransactionsProvider')
  }
  return ctx
}
