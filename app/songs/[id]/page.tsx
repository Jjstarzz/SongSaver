'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/src/context/AuthContext'
import { supabase } from '@/src/lib/supabase'
import { PageWrapper } from '@/src/components/layout/PageWrapper'
import { GlassCard } from '@/src/components/ui/GlassCard'
import { Button } from '@/src/components/ui/Button'
import { KeySuggester } from '@/src/components/features/KeySuggester'
import { transposeChords } from '@/src/utils/chordTransposer'

export default function SongDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [semitones, setSemitones] = useState(0)
  const [showChords, setShowChords] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  const { data: song, isLoading: songLoading } = useQuery({
    queryKey: ['song', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  const { data: lyricsData } = useQuery({
    queryKey: ['song_lyrics', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('song_lyrics')
        .select('*')
        .eq('song_id', id)
        .single()
      return data
    },
    enabled: !!id,
  })

  const rawLyrics = lyricsData?.lyrics ?? ''

  const displayLyrics = (() => {
    if (!rawLyrics) return ''
    if (showChords) return transposeChords(rawLyrics, semitones)
    return rawLyrics.replace(/\[[^\]]*\]/g, '')
  })()

  if (loading || songLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user || !song) return null

  return (
    <PageWrapper>
      <Link href="/songs" className="text-purple-400 mb-4 block">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold text-white mb-1">{song.title}</h1>
      {song.artist && <p className="text-gray-400 text-lg mb-4">{song.artist}</p>}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
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
        {song.time_sig && (
          <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
            {song.time_sig}
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

      {song.youtube_url && (
        <Button
          variant="secondary"
          fullWidth
          className="mb-4"
          onClick={() => window.open(song.youtube_url!, '_blank')}
        >
          ▶ Open Reference Track
        </Button>
      )}

      {song.notes && (
        <GlassCard>
          <p className="uppercase text-xs text-gray-500 tracking-widest mb-1">Team Notes</p>
          <p className="text-gray-200 text-sm">{song.notes}</p>
        </GlassCard>
      )}

      {song.original_key && (
        <KeySuggester
          originalKey={song.original_key}
          onKeyChange={(s) => setSemitones(s)}
        />
      )}

      {rawLyrics && (
        <>
          <div className="flex items-center justify-between mb-2 mt-2">
            <h2 className="text-white font-bold text-lg">Lyrics</h2>
            <button
              onClick={() => setShowChords((v) => !v)}
              className="text-purple-400 text-sm"
            >
              {showChords ? 'Hide Chords' : 'Show Chords'}
            </button>
          </div>
          <GlassCard>
            <pre className="whitespace-pre-wrap font-mono text-gray-200 leading-8 text-sm">
              {displayLyrics}
            </pre>
          </GlassCard>
        </>
      )}
    </PageWrapper>
  )
}
