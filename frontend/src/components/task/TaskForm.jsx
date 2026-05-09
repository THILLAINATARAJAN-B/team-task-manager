import { useForm } from 'react-hook-form'
import { STATUS_OPTIONS, PRIORITY_OPTIONS, parseDueDate } from '../../utils/helpers'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Info } from 'lucide-react'
import Avatar from '../ui/Avatar'

export default function TaskForm({ projectId, onSuccess, initialData, members = [], isOwner = false }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData
      ? { ...initialData, assignedToId: initialData.assignedToId ?? '', dueDate: parseDueDate(initialData.dueDate) }
      : { status: 'TODO', priority: 'MEDIUM' }
  })

  const isEdit        = !!initialData
  const memberEditing = isEdit && !isOwner

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, assignedToId: data.assignedToId ? Number(data.assignedToId) : null, dueDate: data.dueDate || null }
      if (initialData?.id) {
        await api.put(`/api/tasks/${initialData.id}`, payload)
        toast.success('Task updated!')
      } else {
        await api.post(`/api/projects/${projectId}/tasks`, payload)
        toast.success('Task created!')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="input-label">Title *</label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="input"
          placeholder="e.g., Design login page"
          disabled={memberEditing}
        />
        {errors.title && <p className="text-danger-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="input-label">Description</label>
        <textarea
          {...register('description')}
          className="input resize-none"
          rows={3}
          placeholder="Add more details about this task…"
          disabled={memberEditing}
        />
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="input-label">Status</label>
          <select {...register('status')} className="input">
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="input-label">Priority</label>
          <select {...register('priority')} className="input" disabled={memberEditing}>
            {PRIORITY_OPTIONS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date + Assignee */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="input-label">
            Due Date {memberEditing && <span className="text-surface-400 normal-case font-normal ml-1">(owner only)</span>}
          </label>
          <input
            type="date"
            {...register('dueDate')}
            className="input"
            min={new Date().toISOString().split('T')[0]}
            disabled={memberEditing}
          />
        </div>
        <div>
          <label className="input-label">
            Assign To {memberEditing && <span className="text-surface-400 normal-case font-normal ml-1">(owner only)</span>}
          </label>
          <select {...register('assignedToId')} className="input" disabled={memberEditing}>
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.userId} value={m.userId}>{m.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Member banner */}
      {memberEditing && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            As a member, you can only update the <strong>status</strong> of this task. Other fields require owner permissions.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving…' : isEdit ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}