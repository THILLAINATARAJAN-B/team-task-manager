import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center">
        <p className="font-display text-8xl font-bold text-surface-100 mb-2 select-none">404</p>
        <h2 className="font-display text-2xl font-bold text-surface-900 mb-2">Page not found</h2>
        <p className="text-surface-500 mb-8 text-sm">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}