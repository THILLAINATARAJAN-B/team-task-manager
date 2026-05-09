import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, LogOut, Zap, ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-[220px] bg-white border-r border-surface-100 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center gap-2.5 border-b border-surface-100">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <Zap size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-display font-700 text-surface-900 text-[15px] tracking-tight">TaskFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest px-3 mb-2">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            {/* active indicator */}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-surface-100 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <Avatar name={user?.fullName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-surface-900 truncate">{user?.fullName}</p>
            <p className="text-[10px] text-surface-400 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="nav-item w-full text-danger-500 hover:bg-danger-50 hover:text-danger-700"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}