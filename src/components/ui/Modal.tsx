'use client'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-slate-900 border border-white/20 rounded-t-3xl w-full max-w-lg p-6 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
