import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import { AppLayout } from './layouts/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Extrato } from './pages/Extrato'
import { Categorias } from './pages/Categorias'
import { Metas } from './pages/Metas'
import { Chat } from './pages/Chat'
import { Perfil } from './pages/Perfil'
import { TransactionsProvider } from './context/TransactionsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TransactionsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="extrato" element={<Extrato />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="metas" element={<Metas />} />
            <Route path="chat" element={<Chat />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TransactionsProvider>
  </StrictMode>,
)
