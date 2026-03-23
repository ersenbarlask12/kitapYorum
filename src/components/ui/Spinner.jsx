export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }

  return (
    <div
      className={`animate-spin rounded-full border-navy-200 border-t-navy-600 ${sizes[size]} ${className}`}
      role="status"
      aria-label="Yükleniyor..."
    />
  )
}

export function SpinnerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-navy-600 font-medium">Yükleniyor...</p>
      </div>
    </div>
  )
}
