'use client'

import { useState } from 'react'
import { KEYS, transposeNote } from '@/src/utils/chordTransposer'

interface KeySuggesterProps {
  originalKey: string
  onKeyChange: (semitones: number) => void
}

export function KeySuggester({ originalKey, onKeyChange }: KeySuggesterProps) {
  const [semitones, setSemitones] = useState(0)

  const currentKey = transposeNote(originalKey || 'C', semitones)

  const change = (delta: number) => {
    const next = Math.max(-6, Math.min(6, semitones + delta))
    setSemitones(next)
    onKeyChange(next)
  }

  const semitoneLabel =
    semitones === 0
      ? 'Original key'
      : semitones > 0
      ? `+${semitones} semitone${semitones !== 1 ? 's' : ''}`
      : `${semitones} semitone${semitones !== -1 ? 's' : ''}`

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-3">
      <p className="text-white font-bold mb-4">🎹 Key Suggester</p>
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => change(-1)}
          disabled={semitones <= -6}
          className="w-12 h-12 rounded-full bg-purple-600 text-white text-2xl flex items-center justify-center disabled:opacity-40"
        >
          −
        </button>
        <div className="text-center">
          <p className="text-5xl font-bold text-purple-400">{currentKey}</p>
          <p className="text-gray-400 text-sm mt-1">{semitoneLabel}</p>
        </div>
        <button
          onClick={() => change(1)}
          disabled={semitones >= 6}
          className="w-12 h-12 rounded-full bg-purple-600 text-white text-2xl flex items-center justify-center disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}
