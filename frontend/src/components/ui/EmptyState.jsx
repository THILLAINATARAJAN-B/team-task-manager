export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
        <Icon size={22} className="text-surface-400" />
      </div>
      <h3 className="text-sm font-semibold text-surface-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-400 mb-5 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}