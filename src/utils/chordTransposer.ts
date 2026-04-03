export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const KEYS = NOTES

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
}

export function transposeNote(note: string, semitones: number): string {
  const normalized = FLAT_TO_SHARP[note] ?? note
  const index = NOTES.indexOf(normalized)
  if (index === -1) return note
  return NOTES[(index + semitones + 1200) % 12]
}

export function transposeChords(lyrics: string, semitones: number): string {
  if (semitones === 0) return lyrics

  return lyrics.replace(/\[([A-G][#b]?[^\[\]]*)\]/g, (match, chord) => {
    const rootMatch = chord.match(/^([A-G][#b]?)(.*)$/)
    if (!rootMatch) return match
    const [, root, quality] = rootMatch
    const transposed = transposeNote(root, semitones)
    return `[${transposed}${quality}]`
  })
}
