import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md', description }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }[size]

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-[2px]" />

      {/* Panel */}
      <div className={`relative bg-white rounded-2xl shadow-modal w-full ${sizeClass} z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-surface-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-surface-900 font-display">{title}</h2>
            {description && <p className="text-sm text-surface-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors ml-4 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}