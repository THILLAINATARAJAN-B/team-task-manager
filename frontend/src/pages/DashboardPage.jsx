import { useQuery } from '@tanstack/react-query'
import { FolderKanban, CheckSquare, TrendingUp, AlertTriangle, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import StatsCard from '../components/dashboard/StatsCard'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import { formatDate, formatDateRelative } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/ui/Avatar'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard').then(r => r.data),
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 skeleton" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-72 skeleton" />
          <div className="h-72 skeleton" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="font-display text-2xl font-bold text-surface-900">
          {greeting}, {user?.fullName?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-surface-500 mt-1">Here's what's happening across your projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Projects"   value={dashboard?.totalProjects}   icon={FolderKanban}   color="primary" />
        <StatsCard title="My Tasks"         value={dashboard?.totalTasks}      icon={CheckSquare}    color="blue" />
        <StatsCard title="Completed"        value={dashboard?.completedTasks}  icon={TrendingUp}     color="green" />
        <StatsCard title="Overdue"          value={dashboard?.overdueTasks}    icon={AlertTriangle}  color="red" />
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-800 flex items-center gap-2">
              <Clock size={14} className="text-brand-500" /> Recent Tasks
            </h3>
          </div>

          {!dashboard?.recentTasks?.length ? (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="text-sm text-surface-400">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-50">
              {dashboard.recentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{task.title}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{task.projectName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge   status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-800 flex items-center gap-2">
              <FolderKanban size={14} className="text-brand-500" /> Recent Projects
            </h3>
            <Link to="/projects" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {!dashboard?.recentProjects?.length ? (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="text-sm text-surface-400">No projects yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard.recentProjects.map(p => {
                const progress = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0
                return (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="block group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-surface-800 group-hover:text-brand-700 transition-colors">{p.name}</p>
                      <span className="text-xs font-semibold text-surface-500 tabular-nums">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-[11px] text-surface-400">
                      <span>{p.completedTasks}/{p.totalTasks} tasks done</span>
                      {p.deadline && <span>Due {formatDate(p.deadline)}</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}