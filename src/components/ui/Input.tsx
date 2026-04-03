'use client'

interface InputProps {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  type?: string
  error?: string
  multiline?: boolean
  rows?: number
  className?: string
  autoComplete?: string
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  multiline = false,
  rows = 4,
  className = '',
  autoComplete,
}: InputProps) {
  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-base'

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm text-gray-400 mb-1">{label}</label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClass}
        />
      )}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  )
}
