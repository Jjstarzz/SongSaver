'use client'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit'
  className?: string
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl px-4 min-h-[44px] transition-colors focus:outline-none'

  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white',
    danger:
      'bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400',
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}
