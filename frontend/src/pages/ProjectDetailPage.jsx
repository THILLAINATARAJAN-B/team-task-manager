import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, ArrowLeft, Users, Calendar, UserPlus, X, Search, Check, LayoutList, Columns } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import TaskListView from '../components/task/TaskListView'
import KanbanBoard from '../components/task/KanbanBoard'
import TaskForm from '../components/task/TaskForm'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import Avatar from '../components/ui/Avatar'
import { formatDate } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'


export default function ProjectDetailPage() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const queryClient     = useQueryClient()
  const { user }        = useAuth()

  const [showTaskModal, setShowTaskModal]       = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [editingTask, setEditingTask]           = useState(null)
  const [allUsers, setAllUsers]                 = useState([])
  const [memberSearch, setMemberSearch]         = useState('')
  const [viewMode, setViewMode]                 = useState('list')       // 'list' | 'kanban'
  const [statusFilter, setStatusFilter]         = useState('ALL')
  const [assigneeFilter, setAssigneeFilter]     = useState('MY')         // 'MY' | 'UNASSIGNED' | 'ALL'


  // Reset status filter whenever assignee filter changes
  useEffect(() => {
    setStatusFilter('ALL')
  }, [assigneeFilter])


  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/api/projects/${id}`).then(r => r.data),
  })

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => api.get(`/api/projects/${id}/tasks`).then(r => r.data),
  })

  const isOwner = user?.userId === project?.ownerId || user?.role === 'ADMIN'


  // ── Member helpers ────────────────────────────────────────────────────────
  const openMembersModal = async () => {
    try {
      const res = await api.get('/api/users')
      setAllUsers(res.data)
      setShowMembersModal(true)
    } catch { toast.error('Failed to load users') }
  }

  const addMember = async (userId) => {
    try {
      await api.post(`/api/projects/${id}/members/${userId}`)
      queryClient.invalidateQueries(['project', id])
      const res = await api.get('/api/users')
      setAllUsers(res.data)
      toast.success('Member added')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to add member') }
  }

  const removeMember = async (userId) => {
    try {
      await api.delete(`/api/projects/${id}/members/${userId}`)
      queryClient.invalidateQueries(['project', id])
      queryClient.invalidateQueries(['tasks', id])
      const res = await api.get('/api/users')
      setAllUsers(res.data)
      toast.success('Member removed')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to remove member') }
  }


  // ── Task helpers ──────────────────────────────────────────────────────────
  const handleTaskSuccess = () => {
    setShowTaskModal(false)
    setEditingTask(null)
    queryClient.invalidateQueries(['tasks', id])
    queryClient.invalidateQueries(['project', id])
    queryClient.invalidateQueries(['dashboard'])
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/api/tasks/${taskId}`)
      queryClient.invalidateQueries(['tasks', id])
      queryClient.invalidateQueries(['project', id])
      toast.success('Task deleted')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete task') }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status?status=${status}`)
      queryClient.invalidateQueries(['tasks', id])
      queryClient.invalidateQueries(['project', id])
    } catch (err) { toast.error(err.response?.data?.error || 'Cannot update status') }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }


  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (projectLoading || tasksLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 skeleton" />
        <div className="h-24 skeleton" />
        <div className="h-96 skeleton" />
      </div>
    )
  }


  // ── Derived data ──────────────────────────────────────────────────────────
  const memberIds      = project?.members?.map(m => m.userId) || []
  const nonMembers     = allUsers
    .filter(u => !memberIds.includes(u.userId))
    .filter(u =>
      u.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(memberSearch.toLowerCase())
    )
  const currentMembers = (project?.members || []).filter(m =>
    m.fullName.toLowerCase().includes(memberSearch.toLowerCase())
  )

  const progress = project?.totalTasks > 0
    ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0

  // ── Filter helpers ────────────────────────────────────────────────────────
  const STATUS_FILTERS = ['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

  /** Returns tasks that pass the current assignee filter */
  const applyAssigneeFilter = (taskList) => {
    if (assigneeFilter === 'MY')         return taskList.filter(t => t.assignedToId === user?.userId)
    if (assigneeFilter === 'UNASSIGNED') return taskList.filter(t => !t.assignedToId)
    return taskList
  }

  /** Count for a status tab — respects the active assignee filter */
  const statusCount = (status) => {
    const base = applyAssigneeFilter(tasks)
    return status === 'ALL' ? base.length : base.filter(t => t.status === status).length
  }

  /** Final task list shown to the board/list view */
  const filteredTasks = applyAssigneeFilter(tasks).filter(t =>
    statusFilter === 'ALL' ? true : t.status === statusFilter
  )

  /** Pill counts for the assignee filter row */
  const assigneeCounts = {
    MY:         tasks.filter(t => t.assignedToId === user?.userId).length,
    UNASSIGNED: tasks.filter(t => !t.assignedToId).length,
    ALL:        tasks.length,
  }

  const ASSIGNEE_PILLS = [
    { key: 'MY',         label: 'My Tasks'   },
    { key: 'UNASSIGNED', label: 'Unassigned' },
    { key: 'ALL',        label: 'All Tasks'  },
  ]


  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => navigate('/projects')}
            className="mt-0.5 p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-surface-900 truncate">{project?.name}</h2>
            {project?.description && (
              <p className="text-sm text-surface-500 mt-0.5 line-clamp-1">{project.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-surface-400">
              <span className="flex items-center gap-1"><Users size={11} /> {project?.members?.length} members</span>
              {project?.deadline && (
                <span className="flex items-center gap-1"><Calendar size={11} /> Due {formatDate(project.deadline)}</span>
              )}
              <span>{project?.completedTasks}/{project?.totalTasks} tasks done</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isOwner && (
            <button onClick={openMembersModal} className="btn-secondary">
              <UserPlus size={14} /> Members
            </button>
          )}
          <button
            onClick={() => { setEditingTask(null); setShowTaskModal(true) }}
            className="btn-primary"
          >
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>


      {/* ── Progress + team bar ── */}
      <div className="card py-4 flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs text-surface-500 mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="font-bold text-surface-700 tabular-nums">{progress}%</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-success-500' : 'bg-brand-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="w-px h-10 bg-surface-100 hidden sm:block flex-shrink-0" />

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex -space-x-1.5">
            {(project?.members || []).slice(0, 5).map(m => (
              <Avatar key={m.userId} name={m.fullName} size="sm" className="ring-2 ring-white" />
            ))}
          </div>
          {isOwner && (
            <button
              onClick={openMembersModal}
              className="w-7 h-7 rounded-full border-2 border-dashed border-surface-300 flex items-center justify-center hover:border-brand-400 text-surface-400 hover:text-brand-500 transition-colors"
            >
              <Plus size={11} />
            </button>
          )}
        </div>
      </div>


      {/* ── Task toolbar ── */}
      <div className="flex flex-col gap-2">

        {/* Row 1 — Assignee filter pills + View toggle */}
        <div className="flex items-center gap-2">

          {/* Assignee pills */}
          <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-lg">
            {ASSIGNEE_PILLS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setAssigneeFilter(key)}
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  assigneeFilter === key
                    ? 'bg-white text-surface-900 shadow-card'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {/* Blue dot — only on My Tasks pill */}
                {key === 'MY' && (
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                    assigneeFilter === 'MY' ? 'bg-brand-500' : 'bg-surface-300'
                  }`} />
                )}
                {label}
                <span className={`tabular-nums text-[10px] px-1 rounded ${
                  assigneeFilter === key ? 'text-surface-400' : 'text-surface-300'
                }`}>
                  {assigneeCounts[key]}
                </span>
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-card text-surface-800'
                  : 'text-surface-400 hover:text-surface-600'
              }`}
              title="List view"
            >
              <LayoutList size={14} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white shadow-card text-surface-800'
                  : 'text-surface-400 hover:text-surface-600'
              }`}
              title="Kanban view"
            >
              <Columns size={14} />
            </button>
          </div>
        </div>

        {/* Row 2 — Status filter tabs (counts respect active assignee filter) */}
        <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-lg w-fit">
          {STATUS_FILTERS.map(f => {
            const count = statusCount(f)
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all ${
                  statusFilter === f
                    ? 'bg-white text-surface-900 shadow-card'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {f === 'ALL' ? 'All' : f.replace(/_/g, ' ')}
                <span className={`ml-1.5 tabular-nums text-[10px] ${
                  statusFilter === f ? 'text-surface-400' : 'text-surface-300'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

      </div>


      {/* ── Tasks — empty state or board ── */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No tasks yet"
          description="Break down this project into tasks and assign them to your team"
          action={
            <button onClick={() => setShowTaskModal(true)} className="btn-primary">
              <Plus size={15} /> Create Task
            </button>
          }
        />
      ) : filteredTasks.length === 0 ? (
        /* Filtered empty state — tasks exist but none match current filters */
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mb-3">
            <Search size={18} className="text-surface-300" />
          </div>
          <p className="text-sm font-semibold text-surface-600 mb-1">No tasks match this filter</p>
          <p className="text-xs text-surface-400 mb-4 max-w-xs">
            {assigneeFilter === 'MY'
              ? "You don't have any tasks assigned in this view."
              : assigneeFilter === 'UNASSIGNED'
              ? 'All tasks are already assigned to someone.'
              : 'No tasks found for the selected status.'}
          </p>
          <div className="flex items-center gap-2">
            {assigneeFilter !== 'ALL' && (
              <button
                onClick={() => setAssigneeFilter('ALL')}
                className="btn-secondary text-xs"
              >
                Show all tasks
              </button>
            )}
            {statusFilter !== 'ALL' && (
              <button
                onClick={() => setStatusFilter('ALL')}
                className="btn-ghost text-xs"
              >
                Clear status filter
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <TaskListView
          tasks={filteredTasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          currentUser={user}
          isOwner={isOwner}
        />
      ) : (
        <KanbanBoard
          tasks={filteredTasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          currentUser={user}
          isOwner={isOwner}
        />
      )}


      {/* ── Manage Members Modal ── */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => { setShowMembersModal(false); setMemberSearch('') }}
        title="Manage Members"
        description={`${project?.members?.length} current members`}
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
            <input
              type="text"
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              placeholder="Search members…"
              className="input pl-8 text-xs"
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest mb-2">Current Members</p>
            <div className="space-y-1">
              {currentMembers.map(m => (
                <div key={m.userId} className="flex items-center justify-between px-3 py-2.5 bg-surface-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={m.fullName} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-surface-800">{m.fullName}</p>
                      <p className="text-[10px] text-surface-400">{m.email} · {m.role}</p>
                    </div>
                  </div>
                  {m.userId !== user?.userId && (
                    <button
                      onClick={() => removeMember(m.userId)}
                      className="text-[11px] text-danger-500 hover:text-danger-700 font-medium hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {nonMembers.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest mb-2">Add Members</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {nonMembers.map(u => (
                  <div
                    key={u.userId}
                    className="flex items-center justify-between px-3 py-2.5 border border-surface-100 rounded-xl hover:bg-surface-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.fullName} size="sm" />
                      <div>
                        <p className="text-xs font-semibold text-surface-800">{u.fullName}</p>
                        <p className="text-[10px] text-surface-400">{u.email} · {u.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addMember(u.userId)}
                      className="btn-sm bg-brand-50 text-brand-700 hover:bg-brand-100 border-0"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nonMembers.length === 0 && currentMembers.length === 0 && (
            <p className="text-sm text-surface-400 text-center py-4">No users found</p>
          )}
        </div>
      </Modal>


      {/* ── Task Modal ── */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null) }}
        title={editingTask ? 'Edit Task' : 'New Task'}
        description={editingTask ? 'Update task details' : 'Add a new task to this project'}
      >
        <TaskForm
          projectId={id}
          onSuccess={handleTaskSuccess}
          initialData={editingTask}
          members={project?.members || []}
          isOwner={isOwner}
        />
      </Modal>

    </div>
  )
}
