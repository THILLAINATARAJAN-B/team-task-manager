import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { Search, Check, X } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Avatar from '../ui/Avatar'

export default function ProjectForm({ onSuccess, initialData }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialData || {}
  })
  const [allUsers, setAllUsers] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/api/users').then(r => setAllUsers(r.data)).catch(() => {})
  }, [])

  const toggle = (u) =>
    setSelected(p =>
      p.find(m => m.userId === u.userId)
        ? p.filter(m => m.userId !== u.userId)
        : [...p, u]
    )

  const filtered = allUsers.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, memberIds: selected.map(m => m.userId) }
      if (initialData?.id) {
        await api.put(`/api/projects/${initialData.id}`, payload)
        toast.success('Project updated!')
      } else {
        await api.post('/api/projects', payload)
        toast.success('Project created!')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save project')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label className="input-label">Project Name *</label>
        <input
          {...register('name', { required: 'Project name is required' })}
          className="input"
          placeholder="e.g., Website Redesign"
        />
        {errors.name && <p className="text-danger-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="input-label">Description</label>
        <textarea
          {...register('description')}
          className="input resize-none"
          rows={2}
          placeholder="Brief project description…"
        />
      </div>

      {/* Deadline */}
      <div>
        <label className="input-label">Deadline</label>
        <input type="date" {...register('deadline')} className="input" />
      </div>

      {/* Member picker */}
      {allUsers.length > 0 && (
        <div>
          <label className="input-label">Add Team Members</label>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selected.map(u => (
                <span key={u.userId} className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full border border-brand-100">
                  <Avatar name={u.fullName} size="xs" />
                  {u.fullName.split(' ')[0]}
                  <button type="button" onClick={() => toggle(u)} className="hover:text-danger-500 transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="input pl-8 text-xs"
            />
          </div>

          {/* List */}
          <div className="border border-surface-200 rounded-xl divide-y divide-surface-100 max-h-44 overflow-y-auto bg-surface-50/50">
            {filtered.length === 0 ? (
              <p className="text-xs text-surface-400 text-center py-4">No users found</p>
            ) : filtered.map(u => {
              const isSelected = !!selected.find(m => m.userId === u.userId)
              return (
                <div
                  key={u.userId}
                  onClick={() => toggle(u)}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors hover:bg-white ${isSelected ? 'bg-brand-50/70' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={u.fullName} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-surface-800 truncate">{u.fullName}</p>
                      <p className="text-[10px] text-surface-400 truncate">{u.email} · {u.role}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-brand-600 border-brand-600' : 'border-surface-300'}`}>
                    {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              )
            })}
          </div>

          {selected.length > 0 && (
            <p className="text-[11px] text-surface-400 mt-1.5">
              {selected.length} member{selected.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-1">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving…' : initialData ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}