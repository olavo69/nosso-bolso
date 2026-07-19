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
import { Login } from './pages/Login'
import { TransactionsProvider } from './context/TransactionsContext'
import { CategoriesProvider } from './context/CategoriesContext'
import { GoalsProvider } from './context/GoalsContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabaseClient'

function AppGate() {
  const { loading, session } = useAuth()

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-center text-[13.5px] text-text-secondary">
        Supabase não configurado — defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local.
      </div>
    )
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-bg" />
  }

  if (!session) {
    return <Login />
  }

  return (
    <TransactionsProvider>
      <CategoriesProvider>
        <GoalsProvider>
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
        </GoalsProvider>
      </CategoriesProvider>
    </TransactionsProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  </StrictMode>,
)
