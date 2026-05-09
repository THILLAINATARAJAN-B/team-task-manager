import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'

export default function SignupPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/api/auth/signup', data)
      login({ userId: res.data.userId, email: res.data.email, fullName: res.data.fullName, role: res.data.role }, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('root', { message: err.response?.data?.error || 'Signup failed' })
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-surface-900">TaskFlow</span>
        </div>

        <h1 className="font-display text-2xl font-bold text-surface-900 mb-1">Create account</h1>
        <p className="text-sm text-surface-500 mb-8">Join your team on TaskFlow</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <input {...register('fullName', { required: 'Full name is required' })} className="input" placeholder="Alex Johnson" />
            {errors.fullName && <p className="text-danger-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="input-label">Email</label>
            <input
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
              type="email" className="input" placeholder="you@company.com"
            />
            {errors.email && <p className="text-danger-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="input-label">Password</label>
            <input
              {...register('password', { required: true, minLength: { value: 6, message: 'Min 6 characters' } })}
              type="password" className="input" placeholder="Min 6 characters"
            />
            {errors.password && <p className="text-danger-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="input-label">Role</label>
            <select {...register('role')} className="input">
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {errors.root && (
            <div className="bg-danger-50 border border-danger-100 rounded-xl px-4 py-3 text-sm text-danger-700">
              {errors.root.message}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5 mt-2">
            {isSubmitting ? 'Creating…' : <><span>Create account</span><ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="text-sm text-surface-500 text-center mt-6">
          Have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}