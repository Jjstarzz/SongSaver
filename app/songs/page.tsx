'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/src/context/AuthContext'
import { supabase } from '@/src/lib/supabase'
import { PageWrapper } from '@/src/components/layout/PageWrapper'
import { GlassCard } from '@/src/components/ui/GlassCard'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'

export default function SongsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  const { data: songs, isLoading: songsLoading } = useQuery({
    queryKey: ['songs', profile?.team_id],
    queryFn: async () => {
      if (!profile?.team_id) return []
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('team_id', profile.team_id)
        .order('title', { ascending: true })
      if (error) return []
      return data ?? []
    },
    enabled: !!profile?.team_id,
  })

  const filtered = (songs ?? []).filter((s) => {
    const q = searchQuery.toLowerCase()
    return (
      s.title.toLowerCase().includes(q) ||
      (s.artist ?? '').toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return null

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">🎵 Songs</h1>
        <Link href="/songs/add">
          <Button variant="primary">+ Add Song</Button>
        </Link>
      </div>

      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search songs or artists..."
      />

      {songsLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🎶</div>
          <p className="text-white font-semibold text-lg mb-1">
            {searchQuery ? 'No songs found' : 'No songs yet'}
          </p>
          <p className="text-gray-400 text-sm">
            {searchQuery ? 'Try a different search' : 'Tap Add Song to get started'}
          </p>
        </div>
      ) : (
        filtered.map((song) => (
          <Link key={song.id} href={`/songs/${song.id}`}>
            <GlassCard className="cursor-pointer hover:bg-white/15 transition-colors">
              <p className="text-white font-semibold">{song.title}</p>
              {song.artist && <p className="text-gray-400 text-sm mb-2">{song.artist}</p>}
              <div className="flex flex-wrap gap-2 mt-1">
                {song.original_key && (
                  <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
                    🎼 {song.original_key}
                  </span>
                )}
                {song.bpm && (
                  <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
                    ♩ {song.bpm} BPM
                  </span>
                )}
                {song.language && (
                  <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
                    🌐 {song.language}
                  </span>
                )}
                {song.tags && (song.tags as string[]).map((tag) => (
                  <span key={tag} className="bg-teal-500/20 text-teal-300 text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>
          </Link>
        ))
      )}
    </PageWrapper>
  )
}
