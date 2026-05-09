import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit2, Trash2, User, Calendar, Flag, Clock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import TaskForm from '../components/task/TaskForm'
import { formatDate, STATUS_OPTIONS, STATUS_CONFIG } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/ui/Avatar'

export default function TaskDetailPage() {
  const { taskId }      = useParams()
  const navigate        = useNavigate()
  const queryClient     = useQueryClient()
  const { user }        = useAuth()
  const [showEdit, setShowEdit]         = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [deleting, setDeleting]         = useState(false)

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => api.get(`/api/tasks/${taskId}`).then(r => r.data),
  })

  const { data: project } = useQuery({
    queryKey: ['project', task?.projectId],
    queryFn: () => api.get(`/api/projects/${task.projectId}`).then(r => r.data),
    enabled: !!task?.projectId,
  })

  const isOwner  = user?.userId === project?.ownerId || user?.role === 'ADMIN'
  const canDelete = user?.userId === task?.createdById || isOwner

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/tasks/${taskId}`)
      queryClient.invalidateQueries(['tasks', String(task.projectId)])
      queryClient.invalidateQueries(['project', task.projectId])
      navigate(`/projects/${task.projectId}`)
      toast.success('Task deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task')
    } finally {
      setDeleting(false)
    }
  }

  const handleEditSuccess = () => {
    setShowEdit(false)
    queryClient.invalidateQueries(['task', taskId])
    queryClient.invalidateQueries(['tasks', String(task?.projectId)])
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status?status=${newStatus}`)
      queryClient.invalidateQueries(['task', taskId])
      queryClient.invalidateQueries(['tasks', String(task?.projectId)])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status')
    }
  }

  if (isLoading) return (
    <div className="max-w-2xl space-y-4 animate-pulse">
      <div className="h-6 w-32 skeleton" />
      <div className="h-48 skeleton" />
      <div className="h-24 skeleton" />
    </div>
  )

  if (!task) return (
    <div className="flex flex-col items-center py-20">
      <p className="text-surface-500 mb-4">Task not found.</p>
      <button onClick={() => navigate(-1)} className="btn-primary">Go back</button>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-4">
      {/* Back */}
      <button
        onClick={() => navigate(`/projects/${task.projectId}`)}
        className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-900 transition-colors font-medium"
      >
        <ArrowLeft size={14} /> Back to {task.projectName}
      </button>

      {/* Main card */}
      <div className="card space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold text-surface-900 leading-snug">{task.title}</h1>
            {task.description && (
              <p className="text-sm text-surface-600 mt-2 leading-relaxed">{task.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowEdit(true)} className="btn-secondary btn-sm">
              <Edit2 size={12} /> Edit
            </button>
            {canDelete && (
              <button onClick={() => setShowConfirm(true)} className="btn-danger-ghost btn-sm">
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.overdue && (
            <span className="badge bg-danger-50 text-danger-600">Overdue</span>
          )}
        </div>

        {/* DONE stamp */}
        {task.status === 'DONE' && task.completedAt && (
          <div className="flex items-center gap-2 bg-success-50 border border-success-500/20 rounded-xl px-4 py-3 text-sm text-success-700">
            <CheckCircle2 size={15} className="flex-shrink-0" />
            <span>
              Completed {new Date(task.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              {task.completedByName && <strong className="ml-1">by {task.completedByName}</strong>}
            </span>
          </div>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-100">
          {[
            { icon: User,     label: 'Assigned to', value: task.assignedToName || 'Unassigned', isAvatar: !!task.assignedToName },
            { icon: Calendar, label: 'Due date',     value: formatDate(task.dueDate), danger: task.overdue },
            { icon: Flag,     label: 'Created by',   value: task.createdByName, isAvatar: true },
            { icon: Clock,    label: 'Created',      value: formatDate(task.createdAt) },
          ].map(({ icon: Icon, label, value, danger, isAvatar }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={14} className="text-surface-400" />
              </div>
              <div>
                <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                <div className="flex items-center gap-1.5">
                  {isAvatar && value !== 'Unassigned' && <Avatar name={value} size="xs" />}
                  <p className={`text-sm font-semibold ${danger ? 'text-danger-600' : 'text-surface-800'}`}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status changer */}
      <div className="card">
        <p className="text-xs font-semibold text-surface-600 uppercase tracking-wide mb-3">Update Status</p>
        <div className="grid grid-cols-4 gap-2">
          {STATUS_OPTIONS.map(s => {
            const cfg    = STATUS_CONFIG[s]
            const active = task.status === s
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-medium transition-all border
                  ${active
                    ? `${cfg.color} border-current shadow-sm`
                    : 'text-surface-500 border-surface-100 hover:border-surface-200 hover:bg-surface-50'
                  }`}
              >
                <span className={`priority-dot ${cfg.dot}`} />
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Edit modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <TaskForm
          projectId={task.projectId}
          onSuccess={handleEditSuccess}
          initialData={{ id: task.id, title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate, assignedToId: task.assignedToId }}
          members={project?.members || []}
          isOwner={isOwner}
        />
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Task"
        message={`"${task.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete Task"
      />
    </div>
  )
}