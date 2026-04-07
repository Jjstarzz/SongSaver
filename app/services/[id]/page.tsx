'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/src/context/AuthContext'
import { supabase } from '@/src/lib/supabase'
import { PageWrapper } from '@/src/components/layout/PageWrapper'
import { GlassCard } from '@/src/components/ui/GlassCard'
import { Button } from '@/src/components/ui/Button'
import { Modal } from '@/src/components/ui/Modal'

const statusColors: Record<string, string> = {
  draft: 'text-amber-400 bg-amber-400/20 border-amber-400/30',
  confirmed: 'text-green-400 bg-green-400/20 border-green-400/30',
  completed: 'text-gray-400 bg-gray-400/20 border-gray-400/30',
}

export default function ServiceDetailPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()

  const [showAddSongModal, setShowAddSongModal] = useState(false)
  const [editingTransition, setEditingTransition] = useState<string | null>(null)
  const [transitionDraft, setTransitionDraft] = useState('')

  const startEditTransition = (id: string, current: string | null) => {
    setEditingTransition(id)
    setTransitionDraft(current ?? '')
  }

  const saveTransition = async (serviceSongId: string) => {
    await supabase
      .from('service_songs')
      .update({ notes: transitionDraft.trim() || null })
      .eq('id', serviceSongId)
    queryClient.invalidateQueries({ queryKey: ['setlist', id] })
    setEditingTransition(null)
  }

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  const { data: setlist } = useQuery({
    queryKey: ['setlist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_songs')
        .select('*, songs(*)')
        .eq('service_id', id)
        .order('position', { ascending: true })
      if (error) return []
      return data ?? []
    },
    enabled: !!id,
  })

  const { data: allSongs } = useQuery({
    queryKey: ['songs', profile?.team_id],
    queryFn: async () => {
      if (!profile?.team_id) return []
      const { data } = await supabase
        .from('songs')
        .select('*')
        .eq('team_id', profile.team_id)
        .order('title')
      return data ?? []
    },
    enabled: !!profile?.team_id,
  })

  const updateStatus = async (status: string) => {
    await supabase.from('services').update({ status }).eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['service', id] })
    queryClient.invalidateQueries({ queryKey: ['services'] })
  }

  const addSong = async (song: { id: string; original_key: string | null }) => {
    const position = (setlist?.length ?? 0) + 1
    await supabase.from('service_songs').insert({
      service_id: id,
      song_id: song.id,
      position,
      chosen_key: song.original_key,
    })
    queryClient.invalidateQueries({ queryKey: ['setlist', id] })
    setShowAddSongModal(false)
  }

  const removeSong = async (serviceSongId: string) => {
    await supabase.from('service_songs').delete().eq('id', serviceSongId)
    queryClient.invalidateQueries({ queryKey: ['setlist', id] })
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading || serviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user || !service) return null

  const STATUSES = ['draft', 'confirmed', 'completed']

  return (
    <PageWrapper>
      <Link href="/services" className="text-purple-400 mb-4 block">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold text-white mb-1">
        {service.date ? formatDate(service.date) : 'Date TBD'}
      </h1>
      <p className="text-gray-400 mb-1">{service.service_type}</p>
      {service.theme && (
        <p className="text-purple-400 italic mb-4">{service.theme}</p>
      )}

      {/* Status Toggle */}
      <div className="flex gap-2 mb-6">
        {STATUSES.map((s) => (
          <Button
            key={s}
            variant={service.status === s ? 'primary' : 'secondary'}
            onClick={() => updateStatus(s)}
            className="flex-1 capitalize text-sm"
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Setlist */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-lg">🎵 Setlist</h2>
        <Button variant="primary" onClick={() => setShowAddSongModal(true)}>
          Add Song
        </Button>
      </div>

      {!setlist || setlist.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 italic">No songs in this service yet</p>
          <p className="text-gray-500 text-sm mt-1">Tap Add Song to build your setlist</p>
        </div>
      ) : (
        setlist.map((item, index) => {
          const song = item.songs as { title: string; artist: string | null } | null
          const isLast = index === setlist.length - 1
          return (
            <div key={item.id}>
              <GlassCard>
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 text-xl font-bold w-8 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{song?.title ?? 'Unknown'}</p>
                    {song?.artist && (
                      <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                    )}
                  </div>
                  {item.chosen_key && (
                    <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full flex-shrink-0">
                      {item.chosen_key}
                    </span>
                  )}
                  <button
                    onClick={() => removeSong(item.id)}
                    className="text-red-400 hover:text-red-300 ml-2 w-8 h-8 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              </GlassCard>

              {!isLast && (
                <div className="flex items-center gap-2 px-2 py-1 my-1">
                  <div className="flex-shrink-0 text-gray-600 text-sm">↓</div>
                  {editingTransition === item.id ? (
                    <input
                      autoFocus
                      value={transitionDraft}
                      onChange={(e) => setTransitionDraft(e.target.value)}
                      onBlur={() => saveTransition(item.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveTransition(item.id) }}
                      placeholder="Transition idea..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-teal-500"
                    />
                  ) : (
                    <button
                      onClick={() => startEditTransition(item.id, item.notes ?? null)}
                      className="flex-1 text-left text-xs text-gray-600 hover:text-gray-400 italic transition-colors"
                    >
                      {item.notes ? item.notes : 'Add transition idea...'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}

      {service.notes && (
        <GlassCard className="mt-4">
          <p className="uppercase text-xs text-gray-500 tracking-widest mb-1">Notes</p>
          <p className="text-gray-200 text-sm">{service.notes}</p>
        </GlassCard>
      )}

      {/* Add Song Modal */}
      <Modal
        isOpen={showAddSongModal}
        onClose={() => setShowAddSongModal(false)}
        title="Add Song to Setlist"
      >
        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {!allSongs || allSongs.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No songs in library yet</p>
          ) : (
            allSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => addSong(song)}
                className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors"
              >
                <p className="text-white font-semibold">{song.title}</p>
                {song.artist && <p className="text-gray-400 text-sm">{song.artist}</p>}
              </button>
            ))
          )}
        </div>
      </Modal>
    </PageWrapper>
  )
}
