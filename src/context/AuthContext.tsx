'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/src/lib/supabase'

interface Team {
  id: string
  name: string
  church_name: string | null
  invite_code: string | null
}

interface Profile {
  id: string
  team_id: string | null
  name: string | null
  role: string | null
  teams: Team | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ data: { user: User | null } | null; error: Error | null }>
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ data: null, error: null }),
  signOut: async () => {},
  fetchProfile: async () => {},
})

const generateInviteCode = () => Math.random().toString(36).substring(2, 10).toUpperCase()

async function ensureTeam(userId: string, profileData: Profile | null): Promise<Profile | null> {
  if (profileData?.team_id) return profileData

  // Auto-create a personal library for this user
  const { data: team } = await supabase
    .from('teams')
    .insert({ name: 'My Library', invite_code: generateInviteCode() })
    .select()
    .single()

  if (!team) return profileData

  await supabase
    .from('profiles')
    .update({ team_id: team.id, role: 'worship_leader' })
    .eq('id', userId)

  const { data: updated } = await supabase
    .from('profiles')
    .select('*, teams(*)')
    .eq('id', userId)
    .single()

  return updated as Profile | null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, teams(*)')
      .eq('id', userId)
      .single()

    const resolved = await ensureTeam(userId, error ? null : (data as Profile))
    if (resolved) setProfile(resolved)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        // Auto sign-in anonymously so the app works without login
        const { data } = await supabase.auth.signInAnonymously()
        if (data.user) {
          setUser(data.user)
          await fetchProfile(data.user.id)
        }
      }

      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return // handled above
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return { data, error: error as Error | null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    // Re-sign in anonymously after sign out
    const { data } = await supabase.auth.signInAnonymously()
    if (data.user) {
      setUser(data.user)
      await fetchProfile(data.user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
