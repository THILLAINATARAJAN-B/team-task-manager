import { AlertTriangle, Trash2 } from 'lucide-react'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', variant = 'danger', isLoading }) {
  if (!isOpen) return null

  const variantStyles = {
    danger:  { icon: <Trash2 size={20} />, iconBg: 'bg-danger-50 text-danger-600', btn: 'btn-danger' },
    warning: { icon: <AlertTriangle size={20} />, iconBg: 'bg-warning-50 text-warning-700', btn: 'bg-warning-500 hover:bg-warning-600 text-white btn-md' },
  }
  const v = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm z-10 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className={`w-11 h-11 rounded-xl ${v.iconBg} flex items-center justify-center mb-4`}>
          {v.icon}
        </div>
        <h3 className="text-base font-semibold text-surface-900 mb-1 font-display">{title}</h3>
        <p className="text-sm text-surface-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={v.btn}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}