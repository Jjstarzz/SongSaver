'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/src/components/ui/Button'

export function MetronomeWidget() {
  const [bpm, setBpm] = useState(80)
  const [isRunning, setIsRunning] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentBeat((prev) => (prev + 1) % 4)
      }, (60000 / bpm))
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setCurrentBeat(0)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, bpm])

  const changeBpm = (delta: number) => {
    setBpm((prev) => Math.max(40, Math.min(240, prev + delta)))
  }

  return (
    <div>
      <p className="text-white font-bold mb-4">Metronome</p>
      <div className="flex justify-center gap-3 mb-6">
        {[0, 1, 2, 3].map((beat) => (
          <div
            key={beat}
            className={`w-4 h-4 rounded-full transition-all duration-75 ${
              isRunning && currentBeat === beat
                ? 'bg-purple-400 scale-125'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={() => changeBpm(-5)}
          disabled={bpm <= 40}
          className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white text-xl flex items-center justify-center disabled:opacity-40"
        >
          −
        </button>
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{bpm}</p>
          <p className="text-gray-400 text-xs">BPM</p>
        </div>
        <button
          onClick={() => changeBpm(5)}
          disabled={bpm >= 240}
          className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white text-xl flex items-center justify-center disabled:opacity-40"
        >
          +
        </button>
      </div>

      <Button
        variant={isRunning ? 'secondary' : 'primary'}
        fullWidth
        onClick={() => setIsRunning((prev) => !prev)}
      >
        {isRunning ? '⏹ Stop Metronome' : '▶ Start Metronome'}
      </Button>
    </div>
  )
}
