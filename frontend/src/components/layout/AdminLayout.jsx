import { Outlet, NavLink, Link } from 'react-router-dom'
import { FiGrid, FiPackage, FiShoppingBag, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const LINKS = [
  { to: '/admin',          label: 'Dashboard', icon: FiGrid,        end: true },
  { to: '/admin/products', label: 'Products',  icon: FiPackage },
  { to: '/admin/orders',   label: 'Orders',    icon: FiShoppingBag },
]

export default function AdminLayout() {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-gray-50 font-body">
      {/* Sidebar */}
      <aside className="w-60 bg-dark text-cream flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="font-display text-lg font-bold text-cream">
            magnet<span className="text-brand-400">&</span>Posters
          </Link>
          <p className="text-xs text-cream/40 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-brand-600 text-cream' : 'text-cream/70 hover:bg-white/10 hover:text-cream'}`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-6">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm text-cream/70 hover:bg-white/10 hover:text-red-400 transition-colors"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60 flex-1 p-8">
        <Outlet />
      </div>
    </div>
  )
}
