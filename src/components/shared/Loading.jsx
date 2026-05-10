export function Loading({ size = 'md', text }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-nexus-border border-t-nexus-cyan`} />
      {text && <p className="text-nexus-muted text-sm">{text}</p>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 animate-spin rounded-full border-2 border-nexus-border border-t-nexus-cyan mx-auto mb-4" />
        <p className="font-rajdhani text-xl text-nexus-cyan tracking-widest">LOADING...</p>
      </div>
    </div>
  )
}
