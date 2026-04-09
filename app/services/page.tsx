'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/src/context/AuthContext'
import { supabase } from '@/src/lib/supabase'
import { PageWrapper } from '@/src/components/layout/PageWrapper'
import { GlassCard } from '@/src/components/ui/GlassCard'
import { Button } from '@/src/components/ui/Button'
import { Modal } from '@/src/components/ui/Modal'
import { Input } from '@/src/components/ui/Input'

const SERVICE_TYPES = [
  'Sunday Morning',
  'Sunday Evening',
  'Midweek',
  'Special Event',
  'Youth Service',
  'Other',
]

const statusColors: Record<string, string> = {
  draft: 'text-amber-400 bg-amber-400/20 border-amber-400/30',
  confirmed: 'text-green-400 bg-green-400/20 border-green-400/30',
  completed: 'text-gray-400 bg-gray-400/20 border-gray-400/30',
}

export default function ServicesPage() {
  const { profile, loading } = useAuth()
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [date, setDate] = useState('')
  const [serviceType, setServiceType] = useState('Sunday Morning')
  const [theme, setTheme] = useState('')
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', profile?.team_id],
    queryFn: async () => {
      if (!profile?.team_id) return []
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('team_id', profile.team_id)
        .order('date', { ascending: false })
      if (error) return []
      return data ?? []
    },
    enabled: !!profile?.team_id,
  })

  const handleCreate = async () => {
    if (!profile?.team_id) return
    setCreating(true)
    await supabase.from('services').insert({
      team_id: profile.team_id,
      date: date || null,
      service_type: serviceType,
      theme: theme || null,
      notes: notes || null,
      status: 'draft',
    })
    await queryClient.invalidateQueries({ queryKey: ['services'] })
    setShowModal(false)
    setDate('')
    setTheme('')
    setNotes('')
    setCreating(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    )
  }
  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">📋 Services</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          New Service
        </Button>
      </div>

      {servicesLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        </div>
      ) : !services || services.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-white font-semibold text-lg mb-1">No services yet</p>
          <p className="text-gray-400 text-sm">Tap New Service to plan your first service</p>
        </div>
      ) : (
        services.map((service) => (
          <Link key={service.id} href={`/services/${service.id}`}>
            <GlassCard className="cursor-pointer hover:bg-white/15 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold">
                    {service.date ? formatDate(service.date) : 'Date TBD'}
                  </p>
                  <p className="text-gray-400 text-sm">{service.service_type}</p>
                  {service.theme && (
                    <p className="text-purple-400 text-sm italic mt-1">{service.theme}</p>
                  )}
                </div>
                {service.status && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      statusColors[service.status] ?? statusColors.draft
                    }`}
                  >
                    {service.status}
                  </span>
                )}
              </div>
            </GlassCard>
          </Link>
        ))
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Service">
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-base"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Service Type</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {SERVICE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setServiceType(t)}
                className={`flex-shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  serviceType === t
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Input label="Theme" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. God's Faithfulness" />
        <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for the team..." multiline rows={3} />

        <div className="flex gap-3 mt-2">
          <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth loading={creating} onClick={handleCreate}>
            Create Service
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
