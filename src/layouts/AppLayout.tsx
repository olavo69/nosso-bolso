import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'
import { NewTransactionModal } from '../components/modal/NewTransactionModal'

export function AppLayout() {
  const [coupleMode, setCoupleMode] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg font-sans text-text">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          coupleMode={coupleMode}
          onToggleCouple={setCoupleMode}
          onNewTransaction={() => setModalOpen(true)}
        />

        <main
          key={pathname}
          className="view-transition flex-1 overflow-y-auto px-8 pt-7 pb-[60px]"
        >
          <Outlet context={{ coupleMode }} />
        </main>
      </div>

      <NewTransactionModal
        open={modalOpen}
        initialType="despesa"
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
