'use client'

interface PageWrapperProps {
  children: React.ReactNode
  title?: string
}

export function PageWrapper({ children, title }: PageWrapperProps) {
  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28">
      {title && (
        <h1 className="text-2xl font-bold text-white mb-6">{title}</h1>
      )}
      {children}
    </div>
  )
}
