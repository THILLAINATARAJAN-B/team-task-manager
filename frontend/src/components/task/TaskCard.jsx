import { Calendar, User, Edit2, Trash2, CheckCircle2, GripVertical } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '../ui/Badge'
import { formatDate, formatDateRelative, PRIORITY_CONFIG } from '../../utils/helpers'
import Avatar from '../ui/Avatar'
import { useState } from 'react'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, isOwner, currentUser }) {
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const canDelete = isOwner || task.createdById === currentUser?.userId || currentUser?.role === 'ADMIN'
  const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(task.id)
    setDeleting(false)
    setConfirm(false)
  }

  return (
    <>
      <div className={`group flex items-center gap-3 px-4 py-3 bg-white border-b border-surface-100 last:border-0 hover:bg-surface-50/80 transition-colors ${task.overdue ? 'border-l-2 border-l-danger-400' : ''}`}>
        {/* Status checkbox area */}
        <button
          onClick={() => onStatusChange(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}
          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
            task.status === 'DONE'
              ? 'bg-success-500 border-success-500'
              : 'border-surface-300 hover:border-brand-400'
          }`}
        >
          {task.status === 'DONE' && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Priority dot */}
        <div className={`priority-dot ${pCfg.dot} flex-shrink-0`} />

        {/* Main content */}
        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] items-center gap-2">
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'line-through text-surface-400' : 'text-surface-800'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-surface-400 truncate mt-0.5">{task.description}</p>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={task.status} />

            {task.assignedToName && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-surface-400">
                <Avatar name={task.assignedToName} size="xs" />
                <span className="hidden md:inline">{task.assignedToName}</span>
              </div>
            )}

            {task.dueDate && (
              <span className={`hidden sm:flex items-center gap-1 text-[11px] font-medium ${
                task.overdue ? 'text-danger-500' : 'text-surface-400'
              }`}>
                <Calendar size={10} />
                {formatDateRelative(task.dueDate)}
              </span>
            )}

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-md hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"
              >
                <Edit2 size={12} />
              </button>
              {canDelete && (
                <button
                  onClick={() => setConfirm(true)}
                  className="p-1.5 rounded-md hover:bg-danger-50 text-surface-400 hover:text-danger-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Task"
        message={`"${task.title}" will be permanently deleted.`}
        confirmLabel="Delete Task"
      />
    </>
  )
}