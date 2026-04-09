'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/src/context/AuthContext'
import { supabase } from '@/src/lib/supabase'
import { PageWrapper } from '@/src/components/layout/PageWrapper'
import { GlassCard } from '@/src/components/ui/GlassCard'
import { Button } from '@/src/components/ui/Button'

export default function DashboardPage() {
  const { profile, loading, signOut } = useAuth()

  const teamId = profile?.team_id

  const { data: recentSongs } = useQuery({
    queryKey: ['recentSongs', teamId],
    queryFn: async () => {
      if (!teamId) return []
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('team_id', teamId)
        .order('last_used_at', { ascending: false, nullsFirst: false })
        .limit(5)
      if (error) return []
      return data ?? []
    },
    enabled: !!teamId,
  })

  const { data: upcomingServices } = useQuery({
    queryKey: ['upcomingServices', teamId],
    queryFn: async () => {
      if (!teamId) return []
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('team_id', teamId)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(3)
      if (error) return []
      return data ?? []
    },
    enabled: !!teamId,
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    draft: 'text-amber-400 bg-amber-400/20 border-amber-400/30',
    confirmed: 'text-green-400 bg-green-400/20 border-green-400/30',
    completed: 'text-gray-400 bg-gray-400/20 border-gray-400/30',
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm">Welcome back,</p>
          <p className="text-white font-bold text-2xl">{profile?.name ?? 'Musician'}</p>
          {profile?.teams?.name && (
            <p className="text-purple-400 text-sm">{profile.teams.name}</p>
          )}
        </div>
        <Button variant="danger" onClick={signOut} className="text-sm min-h-[36px] px-3">
          Sign Out
        </Button>
      </div>

      {/* Invite Code */}
      {profile?.teams?.invite_code && (
        <GlassCard>
          <p className="uppercase text-xs text-gray-500 tracking-widest mb-1">Team Invite Code</p>
          <p className="text-3xl font-bold text-purple-400 tracking-[0.3em]">
            {profile.teams.invite_code}
          </p>
          <p className="text-gray-400 text-sm mt-1">Share this with your team to invite members</p>
        </GlassCard>
      )}

      {/* Upcoming Services */}
      <h2 className="text-white font-bold text-lg mt-2 mb-3">📅 Upcoming Services</h2>
      {!upcomingServices || upcomingServices.length === 0 ? (
        <p className="text-gray-400 italic text-sm mb-4">No upcoming services</p>
      ) : (
        upcomingServices.map((service) => (
          <GlassCard key={service.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{formatDate(service.date ?? '')}</p>
                <p className="text-gray-400 text-sm">{service.service_type}</p>
                {service.theme && (
                  <p className="text-purple-400 text-sm italic">{service.theme}</p>
                )}
              </div>
              {service.status && (
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${
                    statusColors[service.status] ?? statusColors.draft
                  }`}
                >
                  {service.status}
                </span>
              )}
            </div>
          </GlassCard>
        ))
      )}

      {/* Recently Used Songs */}
      <h2 className="text-white font-bold text-lg mt-2 mb-3">🎵 Recently Used Songs</h2>
      {!recentSongs || recentSongs.length === 0 ? (
        <p className="text-gray-400 italic text-sm">No songs yet</p>
      ) : (
        recentSongs.map((song) => (
          <GlassCard key={song.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{song.title}</p>
                {song.artist && <p className="text-gray-400 text-sm">{song.artist}</p>}
              </div>
              {song.original_key && (
                <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
                  🎼 {song.original_key}
                </span>
              )}
            </div>
          </GlassCard>
        ))
      )}
    </PageWrapper>
  )
}
