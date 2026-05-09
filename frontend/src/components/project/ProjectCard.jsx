import { useNavigate } from 'react-router-dom'
import { Calendar, Users, CheckCircle2, Trash2, ArrowRight } from 'lucide-react'
import { formatDate } from '../../utils/helpers'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import { useState } from 'react'
import ConfirmDialog from '../ui/ConfirmDialog'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ProjectCard({ project, onDelete }) {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const progress = project.totalTasks > 0
    ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0
  const canDelete = user?.userId === project.ownerId || user?.role === 'ADMIN'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/projects/${project.id}`)
      onDelete(project.id)
      toast.success('Project deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete project')
    } finally {
      setDeleting(false)
      setConfirm(false)
    }
  }

  const progressColor = progress === 100 ? 'bg-success-500' : progress > 60 ? 'bg-brand-500' : 'bg-brand-400'

  return (
    <>
      <div
        onClick={() => navigate(`/projects/${project.id}`)}
        className="card-hover group flex flex-col"
      >
        {/* Top */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-surface-900 text-sm leading-snug group-hover:text-brand-700 transition-colors truncate">
              {project.name}
            </h3>
            <p className="text-xs text-surface-400 mt-0.5 line-clamp-1">
              {project.description || 'No description'}
            </p>
          </div>
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirm(true) }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-danger-50 text-surface-300 hover:text-danger-500 transition-all flex-shrink-0"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[11px] text-surface-400 mb-1.5">
            <span>{project.completedTasks ?? 0}/{project.totalTasks ?? 0} tasks</span>
            <span className="font-semibold text-surface-600">{progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-50">
          {/* Member avatars */}
          <div className="flex -space-x-1.5">
            {(project.members || []).slice(0, 4).map(m => (
              <Avatar key={m.userId} name={m.fullName} size="xs" className="ring-2 ring-white" />
            ))}
            {(project.members?.length || 0) > 4 && (
              <div className="w-6 h-6 rounded-full bg-surface-100 ring-2 ring-white flex items-center justify-center text-[10px] font-semibold text-surface-500">
                +{project.members.length - 4}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-surface-400">
            {project.deadline && (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {formatDate(project.deadline)}
              </span>
            )}
            <ArrowRight size={13} className="text-surface-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Project"
        message={`"${project.name}" and all its tasks will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete Project"
      />
    </>
  )
}