import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'

export default function LoginPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/api/auth/login', data)
      login({ userId: res.data.userId, email: res.data.email, fullName: res.data.fullName, role: res.data.role }, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('root', { message: err.response?.data?.error || 'Invalid credentials' })
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-surface-900 p-12 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-white text-base">TaskFlow</span>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-white leading-tight mb-4">
            Organize teams.<br />Ship faster.
          </h2>
          <p className="text-surface-400 text-sm leading-relaxed">
            The professional task management platform for high-performing engineering and product teams.
          </p>
        </div>
        <p className="text-surface-600 text-xs">© 2025 TaskFlow</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-surface-900">TaskFlow</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-surface-900 mb-1">Welcome back</h1>
          <p className="text-sm text-surface-500 mb-8">Sign in to your workspace</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="input-label">Email</label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                className="input"
                placeholder="you@company.com"
                type="email"
              />
              {errors.email && <p className="text-danger-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <input
                {...register('password', { required: 'Password is required' })}
                className="input"
                placeholder="••••••••"
                type="password"
              />
              {errors.password && <p className="text-danger-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <div className="bg-danger-50 border border-danger-100 rounded-xl px-4 py-3 text-sm text-danger-700">
                {errors.root.message}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5 mt-2">
              {isSubmitting ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-sm text-surface-500 text-center mt-6">
            No account?{' '}
            <Link to="/signup" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}