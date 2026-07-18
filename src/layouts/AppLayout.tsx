import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { NewTransactionModal } from '../components/modal/NewTransactionModal'
import type { Transaction } from '../data/mockData'

export type AppOutletContext = {
  coupleMode: boolean
  openEditModal: (transaction: Transaction) => void
}

export function AppLayout() {
  const [coupleMode, setCoupleMode] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const { pathname } = useLocation()

  function openCreateModal() {
    setEditingTx(null)
    setModalOpen(true)
  }

  function openEditModal(transaction: Transaction) {
    setEditingTx(transaction)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingTx(null)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg font-sans text-text">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          coupleMode={coupleMode}
          onToggleCouple={setCoupleMode}
          onNewTransaction={openCreateModal}
        />

        <main
          key={pathname}
          className="view-transition flex-1 overflow-y-auto px-8 pt-7 pb-[60px]"
        >
          <Outlet
            context={{ coupleMode, openEditModal } satisfies AppOutletContext}
          />
        </main>
      </div>

      <NewTransactionModal
        open={modalOpen}
        editing={editingTx}
        defaultType="despesa"
        onClose={closeModal}
      />
    </div>
  )
}
