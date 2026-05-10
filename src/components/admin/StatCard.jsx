export default function StatCard({ icon: Icon, label, value, sub, color = 'cyan' }) {
  const colors = {
    cyan: 'from-nexus-cyan/20 to-nexus-cyan/5 border-nexus-cyan/20 text-nexus-cyan',
    purple: 'from-nexus-purple/20 to-nexus-purple/5 border-nexus-purple/20 text-nexus-purple',
    green: 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400',
  }
  const iconColors = {
    cyan: 'bg-nexus-cyan/10 text-nexus-cyan',
    purple: 'bg-nexus-purple/10 text-nexus-purple',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-nexus-muted text-sm mb-1">{label}</p>
          <p className="font-rajdhani text-3xl font-bold text-nexus-text">{value}</p>
          {sub && <p className="text-nexus-muted text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
