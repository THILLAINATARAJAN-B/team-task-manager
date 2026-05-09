import TaskCard from './TaskCard'
import { STATUS_CONFIG } from '../../utils/helpers'

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

export default function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange, currentUser, isOwner }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map(key => {
        const cfg          = STATUS_CONFIG[key]
        const columnTasks  = tasks.filter(t => t.status === key)

        return (
          <div key={key} className="flex flex-col min-h-0">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={`priority-dot ${cfg.dot}`} />
              <span className="text-xs font-semibold text-surface-600 uppercase tracking-wide flex-1">{cfg.label}</span>
              <span className="text-[11px] font-semibold text-surface-400 bg-surface-100 rounded-full w-5 h-5 flex items-center justify-center">
                {columnTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 bg-surface-50 rounded-xl border border-surface-100 overflow-hidden min-h-24">
              {columnTasks.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-xs text-surface-300">
                  No tasks
                </div>
              ) : (
                columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    currentUser={currentUser}
                    isOwner={isOwner}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}