'use client'

import { useAuth } from '@/src/context/AuthContext'

export function useProfile() {
  const { profile, loading } = useAuth()
  return { profile, loading }
}
