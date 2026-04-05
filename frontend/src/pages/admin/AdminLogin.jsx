import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role !== 'admin') {
        toast.error('Admin access required')
        return
      }
      toast.success('Welcome, Admin!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 font-body">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display text-2xl font-bold text-cream">
            magnet<span className="text-brand-400">&</span>Posters
          </span>
          <p className="text-cream/50 text-sm mt-1">Admin Panel</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="font-display text-xl font-semibold text-cream mb-6">Admin Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-cream/70 mb-1">Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm(f => ({...f, email: e.target.value}))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-cream placeholder:text-cream/30 focus:outline-none focus:border-brand-400"
                placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-sm text-cream/70 mb-1">Password</label>
              <input type="password" required value={form.password}
                onChange={(e) => setForm(f => ({...f, password: e.target.value}))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-cream placeholder:text-cream/30 focus:outline-none focus:border-brand-400"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-cream font-medium py-3 rounded-lg transition-colors mt-2 disabled:opacity-50">
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
