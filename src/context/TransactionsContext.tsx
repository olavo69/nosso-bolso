import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { transactions as initialTransactions, type Transaction } from '../data/mockData'

type TransactionsContextValue = {
  transactions: Transaction[]
  addTransactions: (newTxs: Omit<Transaction, 'id'>[]) => void
  updateTransaction: (id: number, updates: Partial<Omit<Transaction, 'id'>>) => void
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  const addTransactions = (newTxs: Omit<Transaction, 'id'>[]) => {
    setTransactions((prev) => {
      let nextId = Math.max(0, ...prev.map((t) => t.id)) + 1
      return [...prev, ...newTxs.map((tx) => ({ ...tx, id: nextId++ }))]
    })
  }

  const updateTransaction = (
    id: number,
    updates: Partial<Omit<Transaction, 'id'>>,
  ) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    )
  }

  const value = useMemo(
    () => ({ transactions, addTransactions, updateTransaction }),
    [transactions],
  )

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext)
  if (!ctx) {
    throw new Error('useTransactions must be used within a TransactionsProvider')
  }
  return ctx
}
