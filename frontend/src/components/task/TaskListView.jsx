import TaskCard from './TaskCard'
import { STATUS_CONFIG, STATUS_OPTIONS } from '../../utils/helpers'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

function TaskGroup({ statusKey, tasks, onEdit, onDelete, onStatusChange, currentUser, isOwner }) {
  const [collapsed, setCollapsed] = useState(false)
  const cfg = STATUS_CONFIG[statusKey]
  if (tasks.length === 0) return null

  return (
    <div className="mb-2">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center gap-2 w-full px-2 py-2 hover:bg-surface-100 rounded-lg transition-colors group mb-1"
      >
        <span className={`priority-dot ${cfg.dot}`} />
        <span className="text-xs font-semibold text-surface-600 uppercase tracking-wide flex-1 text-left">{cfg.label}</span>
        <span className="text-[11px] text-surface-400 font-medium">{tasks.length}</span>
        {collapsed
          ? <ChevronRight size={13} className="text-surface-300" />
          : <ChevronDown  size={13} className="text-surface-300" />
        }
      </button>

      {!collapsed && (
        <div className="bg-white rounded-xl border border-surface-100 overflow-hidden">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              currentUser={currentUser}
              isOwner={isOwner}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TaskListView({ tasks, onEdit, onDelete, onStatusChange, currentUser, isOwner }) {
  return (
    <div>
      {STATUS_OPTIONS.map(key => (
        <TaskGroup
          key={key}
          statusKey={key}
          tasks={tasks.filter(t => t.status === key)}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          currentUser={currentUser}
          isOwner={isOwner}
        />
      ))}
    </div>
  )
}