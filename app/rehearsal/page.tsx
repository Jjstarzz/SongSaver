'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/src/context/AuthContext'
import { supabase } from '@/src/lib/supabase'
import { PageWrapper } from '@/src/components/layout/PageWrapper'
import { GlassCard } from '@/src/components/ui/GlassCard'
import { MetronomeWidget } from '@/src/components/features/MetronomeWidget'

export default function RehearsalPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isRecording, setIsRecording] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  const { data: recordings } = useQuery({
    queryKey: ['recordings', profile?.team_id],
    queryFn: async () => {
      if (!profile?.team_id) return []
      const { data, error } = await supabase
        .from('rehearsal_recordings')
        .select('*')
        .eq('team_id', profile.team_id)
        .order('created_at', { ascending: false })
      if (error) return []
      return data ?? []
    },
    enabled: !!profile?.team_id,
  })

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.start()
      setIsRecording(true)
    } catch {
      // Microphone access denied or unavailable
    }
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const filename = `recording-${Date.now()}.webm`
      const teamId = profile?.team_id
      if (!teamId) return

      const path = `${teamId}/${filename}`
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(path, blob, { contentType: 'audio/webm' })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('recordings')
          .getPublicUrl(path)

        await supabase.from('rehearsal_recordings').insert({
          team_id: teamId,
          recorded_by: profile?.id,
          audio_url: urlData.publicUrl,
          label: `Recording — ${new Date().toLocaleString()}`,
        })

        queryClient.invalidateQueries({ queryKey: ['recordings'] })
      }
    }

    recorder.stop()
    setIsRecording(false)
  }

  const togglePlay = (item: { id: string; audio_url: string | null }) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (playingId === item.id) {
      setPlayingId(null)
      return
    }

    if (!item.audio_url) return

    const audio = new Audio(item.audio_url)
    audioRef.current = audio
    audio.play()
    setPlayingId(item.id)
    audio.onended = () => setPlayingId(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return null

  return (
    <PageWrapper title="🎙️ Rehearsal">
      {/* Metronome */}
      <GlassCard>
        <MetronomeWidget />
      </GlassCard>

      {/* Audio Recorder */}
      <GlassCard>
        <p className="text-white font-bold mb-4">Audio Recorder</p>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`rounded-2xl py-6 px-8 text-lg font-semibold transition-all ${
              isRecording
                ? 'bg-red-500/40 border border-red-500 text-red-300'
                : 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
            }`}
          >
            {isRecording ? '⏹ Stop Recording' : '⏺ Start Recording'}
          </button>

          {isRecording && (
            <p className="text-red-400 animate-pulse font-medium">🔴 Recording...</p>
          )}
        </div>
      </GlassCard>

      {/* Recordings */}
      <h2 className="text-white font-bold text-lg mb-3">Saved Recordings</h2>

      {!recordings || recordings.length === 0 ? (
        <p className="text-gray-400 italic text-sm">No recordings yet</p>
      ) : (
        recordings.map((item) => (
          <GlassCard key={item.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-white font-medium truncate">{item.label}</p>
                <p className="text-gray-400 text-sm">{formatDate(item.created_at)}</p>
              </div>
              <button
                onClick={() => togglePlay(item)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-colors ${
                  playingId === item.id ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {playingId === item.id ? '⏹' : '▶'}
              </button>
            </div>
          </GlassCard>
        ))
      )}
    </PageWrapper>
  )
}
