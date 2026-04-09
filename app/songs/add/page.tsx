'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/src/context/AuthContext'
import { supabase } from '@/src/lib/supabase'
import { PageWrapper } from '@/src/components/layout/PageWrapper'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'

const ALL_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const TIME_SIGS = ['4/4', '3/4', '6/8', '12/8', '2/4']
const PRESET_TAGS = ['Praise', 'Worship', 'Hope', 'Holy Communion', 'Prayer', 'Christmas', 'Easter', 'Offering', 'Reflection', 'Communion']

export default function AddSongPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [language, setLanguage] = useState('English')
  const [bpm, setBpm] = useState('')
  const [selectedKey, setSelectedKey] = useState('C')
  const [timeSig, setTimeSig] = useState('4/4')
  const [lyrics, setLyrics] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  const addCustomTag = () => {
    const t = customTag.trim()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setCustomTag('')
  }

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Song title is required')
      return
    }
    if (!profile?.team_id) {
      setError('Your account setup is incomplete. Please sign out and sign up again.')
      return
    }

    setError('')
    setSubmitting(true)

    const { data: song, error: insertError } = await supabase
      .from('songs')
      .insert({
        team_id: profile.team_id,
        title: title.trim(),
        artist: artist.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
        language: language || 'English',
        bpm: bpm ? parseInt(bpm) : null,
        original_key: selectedKey,
        time_sig: timeSig,
        notes: notes.trim() || null,
        tags: tags.length > 0 ? tags : null,
      })
      .select()
      .single()

    if (insertError || !song) {
      setError(insertError?.message ?? 'Failed to save song')
      setSubmitting(false)
      return
    }

    if (lyrics.trim()) {
      await supabase.from('song_lyrics').insert({
        song_id: song.id,
        language: language || 'English',
        lyrics: lyrics.trim(),
      })
    }

    await queryClient.invalidateQueries({ queryKey: ['songs'] })
    router.push('/songs')
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
    <PageWrapper>
      <Link href="/songs" className="text-purple-400 mb-4 block">
        ← Back
      </Link>
      <h1 className="text-xl font-bold text-white mb-6">Add New Song</h1>

      <Input label="Song Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Amazing Grace" />
      <Input label="Artist / Songwriter" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="John Newton" />
      <Input label="YouTube / Spotify URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." type="url" />
      <Input label="Language" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="English" />
      <Input label="BPM" value={bpm} onChange={(e) => setBpm(e.target.value)} placeholder="76" type="number" />

      {/* Key Selector */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Original Key</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {ALL_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => setSelectedKey(k)}
              className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                selectedKey === k
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Time Signature */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Time Signature</label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TIME_SIGS.map((sig) => (
            <button
              key={sig}
              onClick={() => setTimeSig(sig)}
              className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                timeSig === sig
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {sig}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESET_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                tags.includes(tag)
                  ? 'bg-teal-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {tags.filter((t) => !PRESET_TAGS.includes(t)).map((t) => (
          <span key={t} className="inline-flex items-center gap-1 bg-teal-600 text-white rounded-full px-3 py-1 text-xs font-semibold mr-2 mb-2">
            {t}
            <button onClick={() => toggleTag(t)} className="ml-1 hover:text-teal-200">✕</button>
          </span>
        ))}
        <div className="flex gap-2 mt-1">
          <input
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }}
            placeholder="Add custom tag..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={addCustomTag}
            className="bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl px-3 py-2 text-sm transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Lyrics */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Lyrics with Chords</label>
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          rows={10}
          placeholder={`[G]Amazing [D]grace how [Em]sweet the sound\nType chords in square brackets before the word they fall on`}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm font-mono resize-none"
        />
      </div>

      <Input label="Team Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Capo 2, start slow..." multiline rows={3} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      <Button fullWidth loading={submitting} onClick={handleSave}>
        Save Song 🎵
      </Button>
    </PageWrapper>
  )
}
