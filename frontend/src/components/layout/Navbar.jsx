import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/projects':  'Projects',
}

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isProjectDetail = location.pathname.startsWith('/projects/') && location.pathname !== '/projects/'

  return (
    <header className="h-14 bg-white border-b border-surface-100 px-6 flex items-center gap-2 flex-shrink-0">
      {isProjectDetail ? (
        <nav className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => navigate('/projects')}
            className="text-surface-400 hover:text-surface-700 transition-colors font-medium"
          >
            Projects
          </button>
          <ChevronRight size={14} className="text-surface-300" />
          <span className="text-surface-800 font-semibold">Project Details</span>
        </nav>
      ) : (
        <h1 className="text-sm font-semibold text-surface-900">
          {PAGE_TITLES[location.pathname] || 'TaskFlow'}
        </h1>
      )}
    </header>
  )
}