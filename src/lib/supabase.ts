'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

let _client: ReturnType<typeof createClientComponentClient> | null = null

function getClient() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    // Defer creation to avoid crashing at build time with placeholder values
    if (!url.startsWith('http') || !key) {
      throw new Error('Supabase environment variables are not configured. Please update .env.local')
    }
    _client = createClientComponentClient({ supabaseUrl: url, supabaseKey: key })
  }
  return _client
}

// Proxy so existing code can use `supabase.from(...)` etc. unchanged
export const supabase = new Proxy({} as ReturnType<typeof createClientComponentClient>, {
  get(_target, prop) {
    const client = getClient()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          church_name: string | null
          invite_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          church_name?: string | null
          invite_code?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          church_name?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          team_id: string | null
          name: string | null
          role: string | null
          vocal_min: number | null
          vocal_max: number | null
          created_at: string
        }
        Insert: {
          id: string
          team_id?: string | null
          name?: string | null
          role?: string | null
        }
        Update: {
          team_id?: string | null
          name?: string | null
          role?: string | null
        }
      }
      songs: {
        Row: {
          id: string
          team_id: string
          title: string
          artist: string | null
          ccli: string | null
          original_key: string | null
          bpm: number | null
          time_sig: string | null
          duration: number | null
          tags: string[] | null
          language: string | null
          youtube_url: string | null
          notes: string | null
          usage_count: number | null
          last_used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          title: string
          artist?: string | null
          ccli?: string | null
          original_key?: string | null
          bpm?: number | null
          time_sig?: string | null
          duration?: number | null
          tags?: string[] | null
          language?: string | null
          youtube_url?: string | null
          notes?: string | null
        }
        Update: {
          title?: string
          artist?: string | null
          original_key?: string | null
          bpm?: number | null
          time_sig?: string | null
          language?: string | null
          youtube_url?: string | null
          notes?: string | null
        }
      }
      song_lyrics: {
        Row: {
          id: string
          song_id: string
          language: string
          lyrics: string | null
        }
        Insert: {
          id?: string
          song_id: string
          language: string
          lyrics?: string | null
        }
        Update: {
          lyrics?: string | null
        }
      }
      song_attachments: {
        Row: {
          id: string
          song_id: string
          file_url: string | null
          file_name: string | null
          file_type: string | null
        }
        Insert: {
          id?: string
          song_id: string
          file_url?: string | null
          file_name?: string | null
          file_type?: string | null
        }
        Update: Record<string, never>
      }
      services: {
        Row: {
          id: string
          team_id: string
          date: string | null
          service_type: string | null
          theme: string | null
          notes: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          date?: string | null
          service_type?: string | null
          theme?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          date?: string | null
          service_type?: string | null
          theme?: string | null
          notes?: string | null
          status?: string | null
        }
      }
      service_songs: {
        Row: {
          id: string
          service_id: string
          song_id: string | null
          position: number | null
          chosen_key: string | null
          vocalist_id: string | null
          notes: string | null
          songs?: {
            id: string
            title: string
            artist: string | null
            original_key: string | null
          }
        }
        Insert: {
          id?: string
          service_id: string
          song_id?: string | null
          position?: number | null
          chosen_key?: string | null
          vocalist_id?: string | null
          notes?: string | null
        }
        Update: {
          position?: number | null
          chosen_key?: string | null
        }
      }
      rehearsal_recordings: {
        Row: {
          id: string
          song_id: string | null
          service_id: string | null
          team_id: string | null
          recorded_by: string | null
          audio_url: string | null
          label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          song_id?: string | null
          service_id?: string | null
          team_id?: string | null
          recorded_by?: string | null
          audio_url?: string | null
          label?: string | null
        }
        Update: Record<string, never>
      }
    }
  }
}
