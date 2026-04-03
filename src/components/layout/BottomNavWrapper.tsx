'use client'

import { useAuth } from '@/src/context/AuthContext'
import { BottomNav } from './BottomNav'

export function BottomNavWrapper() {
  const { user } = useAuth()
  if (!user) return null
  return <BottomNav />
}
