export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-5xl mb-4 opacity-50">{icon}</div>}
      <h3 className="font-rajdhani text-2xl font-semibold text-nexus-text mb-2">{title}</h3>
      {description && <p className="text-nexus-muted max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}
