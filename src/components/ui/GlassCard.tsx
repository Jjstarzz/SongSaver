'use client'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-3 ${className}`}
    >
      {children}
    </div>
  )
}
