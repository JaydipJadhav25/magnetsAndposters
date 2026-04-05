// ─── LoginPage ────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-dark">Welcome back</h1>
          <p className="text-gray-500 mt-2">Log in to your account</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm(f => ({...f, email: e.target.value}))}
                className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Password</label>
              <input type="password" required value={form.password} onChange={(e) => setForm(f => ({...f, password: e.target.value}))}
                className="input-field" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account? <Link to="/register" className="text-brand-600 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── RegisterPage ─────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-dark">Create Account</h1>
          <p className="text-gray-500 mt-2">Join magnetAndPosters today</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name',     label: 'Full Name',    type: 'text',     ph: 'Your name' },
              { key: 'email',    label: 'Email',        type: 'email',    ph: 'you@example.com' },
              { key: 'phone',    label: 'Phone (optional)', type: 'tel', ph: '10-digit mobile' },
              { key: 'password', label: 'Password',     type: 'password', ph: 'Min 6 characters' },
            ].map(({ key, label, type, ph }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-dark mb-1">{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm(f => ({...f, [key]: e.target.value}))}
                  className="input-field" placeholder={ph} required={key !== 'phone'} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── OrdersPage ───────────────────────────────────────────────────────────────
import { useEffect } from 'react'
import api from '../utils/api'
import { formatPrice } from '../utils/helpers'
import { FiPackage } from 'react-icons/fi'

export function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my')
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const STATUS_COLORS = {
    placed: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="section-title mb-8">My Orders</h1>
      {loading ? (
        <div className="space-y-4">{Array.from({length:3}).map((_,i) => <div key={i} className="card p-6 animate-pulse h-24" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-dark mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link to="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-dark">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                    {order.orderStatus}
                  </span>
                  <span className="font-bold text-dark">{formatPrice(order.total)}</span>
                </div>
              </div>
              <ul className="space-y-1.5">
                {order.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-brand-600">·</span>
                    {item.productName} {item.variant && `(${item.variant})`} × {item.quantity}
                  </li>
                ))}
              </ul>
              {order.trackingNumber && (
                <p className="text-xs text-brand-600 mt-2 font-medium">
                  Tracking: {order.courier} – {order.trackingNumber}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── BulkOrderPage ────────────────────────────────────────────────────────────
export function BulkOrderPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', quantity:'', details:'' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const wa = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919025926436'}?text=${encodeURIComponent(`Bulk Order Enquiry\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nQuantity: ${form.quantity}\nDetails: ${form.details}`)}`
    window.open(wa, '_blank')
    setSent(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="section-title">Bulk Orders</h1>
        <p className="text-gray-500 mt-3 text-lg">Planning for weddings, corporates, or events? We've got you covered with special pricing!</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { icon:'💍', title:'Weddings',      desc:'Personalised return gifts for all your guests' },
          { icon:'🏢', title:'Corporate',     desc:'Branded magnets for events & employee gifts' },
          { icon:'🎉', title:'Celebrations',  desc:'Birthdays, reunions, baby showers & more' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="card p-5 text-center">
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="font-display font-semibold text-dark mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
      {sent ? (
        <div className="text-center card p-10">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="font-display text-2xl font-bold text-dark mb-2">Thank you!</h3>
          <p className="text-gray-500">We've opened WhatsApp with your details. We'll get back to you within 24 hours.</p>
        </div>
      ) : (
        <div className="card p-8">
          <h2 className="font-display text-xl font-semibold text-dark mb-5">Send Bulk Enquiry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name:'name', label:'Name', type:'text' },
              { name:'email', label:'Email', type:'email' },
              { name:'phone', label:'Phone', type:'tel' },
              { name:'quantity', label:'Approximate Quantity', type:'number' },
            ].map(({ name, label, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-dark mb-1">{label} <span className="text-red-500">*</span></label>
                <input type={type} required value={form[name]} onChange={(e) => setForm(f => ({...f, [name]: e.target.value}))} className="input-field" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Additional Details</label>
              <textarea rows={3} value={form.details} onChange={(e) => setForm(f => ({...f, details: e.target.value}))}
                className="input-field resize-none" placeholder="Type of event, design preferences, deadline…" />
            </div>
            <button type="submit" className="btn-primary w-full py-3">Send via WhatsApp</button>
          </form>
        </div>
      )}
    </div>
  )
}

// ─── AboutPage ────────────────────────────────────────────────────────────────
export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="section-title">About Us</h1>
        <p className="text-gray-500 mt-3 text-lg">The story behind magnetAndPosters</p>
      </div>
      <div className="prose prose-lg mx-auto text-gray-600 space-y-5">
        <p>At <strong className="text-dark">magnetAndPosters</strong>, we believe every photo deserves to be more than just a file on your phone. We turn your favourite memories into beautiful custom photo magnets and posters — the perfect little keepsake for your home or a heartfelt personalised gift.</p>
        <p>We started this journey with one simple idea: <em>What if your fridge could tell your story?</em> Since then, we've helped hundreds of happy customers in India preserve their memories in a way that's tangible, beautiful, and lasting.</p>
        <p>Every product is printed at full resolution, using premium materials, and crafted with care before being delivered to your doorstep.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-6 mt-12">
        {[['500+', 'Happy Customers'], ['100%', 'Quality Guaranteed'], ['5★', 'Average Rating']].map(([n, l]) => (
          <div key={l} className="card p-6 text-center">
            <p className="font-display text-4xl font-bold text-brand-600">{n}</p>
            <p className="text-sm text-gray-500 mt-1">{l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ContactPage ──────────────────────────────────────────────────────────────
export function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="section-title">Contact Us</h1>
        <p className="text-gray-500 mt-3">We'd love to hear from you</p>
      </div>
      <div className="card p-8 space-y-6">
        {[
          { icon:'💬', title:'WhatsApp (Preferred)', desc:'+91 90259 26436', link:`https://wa.me/919025926436` },
          { icon:'📧', title:'Email', desc:'hello.magnetandposters@gmail.com', link:'mailto:hello.magnetandposters@gmail.com' },
          { icon:'🕐', title:'Business Hours', desc:'Monday–Friday, 10am–5pm IST' },
        ].map(({ icon, title, desc, link }) => (
          <div key={title} className="flex gap-4 items-start">
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="font-semibold text-dark">{title}</p>
              {link
                ? <a href={link} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{desc}</a>
                : <p className="text-gray-500">{desc}</p>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── NotFoundPage ─────────────────────────────────────────────────────────────
export function NotFoundPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="font-display text-8xl font-bold text-brand-200 mb-4">404</p>
      <h1 className="font-display text-3xl font-bold text-dark mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  )
}

export default LoginPage
