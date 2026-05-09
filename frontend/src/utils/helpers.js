export const STATUS_CONFIG = {
  TODO:        { label: 'To Do',       color: 'bg-surface-100 text-surface-600',  dot: 'bg-surface-400'  },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-50 text-blue-700',         dot: 'bg-blue-500'     },
  IN_REVIEW:   { label: 'In Review',   color: 'bg-amber-50 text-amber-700',       dot: 'bg-amber-500'    },
  DONE:        { label: 'Done',        color: 'bg-success-50 text-success-700',   dot: 'bg-success-500'  },
}

export const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    color: 'bg-surface-100 text-surface-500', dot: 'bg-surface-400', ring: 'ring-surface-300' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-50 text-blue-600',        dot: 'bg-blue-400',    ring: 'ring-blue-300'   },
  HIGH:   { label: 'High',   color: 'bg-orange-50 text-orange-700',    dot: 'bg-orange-400',  ring: 'ring-orange-300' },
  URGENT: { label: 'Urgent', color: 'bg-danger-50 text-danger-700',    dot: 'bg-danger-500',  ring: 'ring-danger-300' },
}

// keep these for backward compat
export const STATUS_COLORS   = Object.fromEntries(Object.entries(STATUS_CONFIG).map(([k,v])=>[k,v.color]))
export const PRIORITY_COLORS = Object.fromEntries(Object.entries(PRIORITY_CONFIG).map(([k,v])=>[k,v.color]))

export const STATUS_OPTIONS   = ['TODO','IN_PROGRESS','IN_REVIEW','DONE']
export const PRIORITY_OPTIONS = ['LOW','MEDIUM','HIGH','URGENT']

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function formatDateRelative(dateStr) {
  if (!dateStr) return '—'
  const d   = new Date(dateStr)
  const now = new Date()
  const diff = Math.round((d - now) / 86400000)
  if (diff === 0)  return 'Today'
  if (diff === 1)  return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 0 && diff < 7) return `In ${diff}d`
  if (diff < 0 && diff > -7) return `${Math.abs(diff)}d ago`
  return formatDate(dateStr)
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'DONE') return false
  return new Date(dueDate) < new Date()
}

export function parseDueDate(val) {
  if (!val) return ''
  return String(val).slice(0, 10)
}

export function getAvatarColor(name) {
  const colors = [
    'bg-violet-500','bg-indigo-500','bg-blue-500','bg-cyan-500',
    'bg-teal-500','bg-emerald-500','bg-orange-500','bg-rose-500',
  ]
  const i = (name || '').split('').reduce((a,c) => a + c.charCodeAt(0), 0)
  return colors[i % colors.length]
}