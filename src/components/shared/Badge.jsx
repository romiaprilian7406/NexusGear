import { cn } from '../../lib/utils'

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-nexus-border text-nexus-muted',
    cyan: 'bg-nexus-cyan/10 text-nexus-cyan border border-nexus-cyan/30',
    purple: 'bg-nexus-purple/10 text-nexus-purple border border-nexus-purple/30',
    success: 'bg-green-500/10 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
