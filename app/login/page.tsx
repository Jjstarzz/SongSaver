'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/src/context/AuthContext'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'

export default function LoginPage() {
  const { signIn, user, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError.message || 'Invalid email or password')
      setSubmitting(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1e] via-[#1e1b4b] to-[#0f0a1e] flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
        <div className="text-6xl text-center mb-2">🎵</div>
        <h1 className="text-3xl font-bold text-white text-center">SongSaver</h1>
        <p className="text-purple-400 text-center mb-8">Worship Team Management</p>

        <form onSubmit={handleSubmit}>
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
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={submitting}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-purple-400 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
