import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/helpers'

export default function Badge({ label, colorClass, variant = 'default' }) {
  const display = label?.replace(/_/g, ' ')
  return (
    <span className={`badge ${colorClass}`}>{display}</span>
  )
}

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.TODO
  return (
    <span className={`badge gap-1.5 ${cfg.color}`}>
      <span className={`priority-dot ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM
  return (
    <span className={`badge ${cfg.color}`}>{cfg.label}</span>
  )
}