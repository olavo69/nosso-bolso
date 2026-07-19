import type { Session } from '@supabase/supabase-js'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabaseClient'
import type { ProfileRow } from '../types/db'

type AuthContextValue = {
  loading: boolean
  session: Session | null
  profile: ProfileRow | null
  partnerProfile: ProfileRow | null
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<ProfileRow | null>(null)

  async function loadProfile(userId: string) {
    if (!supabase) return

    const { data: ownProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    setProfile(ownProfile)

    if (ownProfile?.couple_id) {
      const { data: partner } = await supabase
        .from('profiles')
        .select('*')
        .eq('couple_id', ownProfile.couple_id)
        .neq('id', userId)
        .maybeSingle()
      setPartnerProfile(partner ?? null)
    } else {
      setPartnerProfile(null)
    }
  }

  async function refreshProfile() {
    if (session?.user) await loadProfile(session.user.id)
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        loadProfile(newSession.user.id)
      } else {
        setProfile(null)
        setPartnerProfile(null)
      }
    })

    return () => subscription.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function signOut() {
    await supabase?.auth.signOut()
  }

  const value = useMemo(
    () => ({ loading, session, profile, partnerProfile, refreshProfile, signOut }),
    [loading, session, profile, partnerProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
