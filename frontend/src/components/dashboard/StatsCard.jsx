export default function StatsCard({ title, value, icon: Icon, color = 'primary', trend, sub }) {
  const colorMap = {
    primary: { bg: 'bg-brand-50',   text: 'text-brand-600',   val: 'text-surface-900' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    val: 'text-surface-900' },
    green:   { bg: 'bg-success-50', text: 'text-success-700', val: 'text-surface-900' },
    red:     { bg: 'bg-danger-50',  text: 'text-danger-600',  val: 'text-surface-900' },
    orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  val: 'text-surface-900' },
  }
  const c = colorMap[color]

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>
          <Icon size={17} strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${trend >= 0 ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className={`text-2xl font-bold font-display ${c.val} tabular-nums`}>{value ?? '—'}</p>
        <p className="text-xs text-surface-500 mt-0.5 font-medium">{title}</p>
        {sub && <p className="text-[10px] text-surface-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}