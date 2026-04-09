'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/src/context/AuthContext'
import { supabase } from '@/src/lib/supabase'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'

export default function SignupPage() {
  const { signUp, user, loading } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'create' | 'join' | 'solo'>('solo')
  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const generateInviteCode = () => Math.random().toString(36).substring(2, 10).toUpperCase()

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Name is required'); return }
    if (!email.trim()) { setError('Email is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (mode === 'create' && !teamName.trim()) { setError('Team name is required'); return }
    if (mode === 'join' && !inviteCode.trim()) { setError('Invite code is required'); return }


    setSubmitting(true)

    const { data, error: signUpError } = await signUp(email, password, name)

    if (signUpError || !data?.user) {
      setError(signUpError?.message || 'Failed to create account')
      setSubmitting(false)
      return
    }

    const userId = data.user.id

    if (mode === 'solo') {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({ name: `${name.trim()}'s Library`, invite_code: generateInviteCode() })
        .select()
        .single()

      if (teamError || !team) {
        setError('Failed to set up your account')
        setSubmitting(false)
        return
      }

      await supabase
        .from('profiles')
        .update({ team_id: team.id, role: 'worship_leader', name })
        .eq('id', userId)
    } else if (mode === 'create') {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({ name: teamName, invite_code: generateInviteCode() })
        .select()
        .single()

      if (teamError || !team) {
        setError('Failed to create team')
        setSubmitting(false)
        return
      }

      await supabase
        .from('profiles')
        .update({ team_id: team.id, role: 'worship_leader', name })
        .eq('id', userId)
    } else {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select()
        .eq('invite_code', inviteCode.trim())
        .single()

      if (teamError || !team) {
        setError('Invite code not found. Please check and try again.')
        setSubmitting(false)
        return
      }

      await supabase
        .from('profiles')
        .update({ team_id: team.id, name })
        .eq('id', userId)
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1e] via-[#1e1b4b] to-[#0f0a1e] flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
        <div className="text-6xl text-center mb-2">🎵</div>
        <h1 className="text-3xl font-bold text-white text-center">SongSaver</h1>
        <p className="text-purple-400 text-center mb-8">Create your account</p>

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            autoComplete="new-password"
          />

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Team (optional)</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMode('solo')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  mode === 'solo'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                Solo Use
              </button>
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  mode === 'create'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                Create Team
              </button>
              <button
                type="button"
                onClick={() => setMode('join')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  mode === 'join'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                Join Team
              </button>
            </div>
          </div>

          {mode === 'create' && (
            <Input
              label="Church / Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Grace Community Church"
            />
          )}
          {mode === 'join' && (
            <Input
              label="8-Character Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="abc12345"
            />
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={submitting}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
