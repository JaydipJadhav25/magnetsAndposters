import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { label: 'Home',         to: '/' },
  { label: 'Photo Magnet', to: '/shop/photo-magnet' },
  { label: 'Quote Magnet', to: '/shop/quote-magnet' },
  { label: 'Bulk Order',   to: '/bulk-orders' },
  { label: 'About Us',     to: '/about' },
  { label: 'Contact',      to: '/contact' },
  { label: 'Shop All',     to: '/shop' },
]

export default function Navbar() {
  const { itemCount, setIsOpen } = useCart()
  const { user, logout }         = useAuth()
  const navigate                 = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Top banner */}
      <div className="bg-brand-600 text-cream text-center text-xs sm:text-sm py-2 px-4 font-body">
        Free Shipping on Orders Above ₹699/-
      </div>

      {/* Social strip (desktop) */}
      <div className="hidden md:flex items-center justify-between px-8 py-2 border-b border-brand-100 bg-cream text-xs text-gray-500 font-body">
        <div className="flex gap-4">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-brand-600 transition-colors">Instagram</a>
          <a href="https://youtube.com"   target="_blank" rel="noreferrer" className="hover:text-brand-600 transition-colors">YouTube</a>
          <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-brand-600 transition-colors">Pinterest</a>
        </div>
        <p className="italic font-accent text-sm text-brand-700">Turn your memories into Beautiful Keepsakes</p>
      </div>

      {/* Main nav */}
      <header className={`sticky top-0 z-40 bg-cream transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-brand-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="font-display text-2xl md:text-3xl font-bold text-dark tracking-tight">
                magnet<span className="text-brand-600">&</span>Posters
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-body font-medium rounded-md transition-colors duration-150
                    ${isActive ? 'text-brand-600 bg-brand-50' : 'text-dark hover:text-brand-600 hover:bg-brand-50'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* User */}
              {user ? (
                <div className="relative group hidden md:block">
                  <button className="flex items-center gap-1.5 text-dark hover:text-brand-600 transition-colors p-2">
                    <FiUser size={20} />
                    <span className="text-sm font-body hidden lg:inline">{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-1 z-50">
                    <Link to="/orders" className="block px-4 py-2.5 text-sm font-body text-dark hover:bg-brand-50 hover:text-brand-600">My Orders</Link>
                    {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2.5 text-sm font-body text-dark hover:bg-brand-50 hover:text-brand-600">Admin Panel</Link>}
                    <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm font-body text-dark hover:bg-brand-50 hover:text-red-600">Log out</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex items-center gap-1.5 text-sm font-body font-medium text-dark hover:text-brand-600 transition-colors p-2">
                  <FiUser size={20} />
                  <span className="hidden lg:inline">Log in</span>
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative flex items-center p-2 text-dark hover:text-brand-600 transition-colors"
                aria-label="Open cart"
              >
                <FiShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-cream text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-dark hover:text-brand-600 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-brand-100 bg-cream animate-fade-in">
            <nav className="flex flex-col py-2">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-6 py-3 text-sm font-body font-medium transition-colors
                    ${isActive ? 'text-brand-600 bg-brand-50' : 'text-dark hover:text-brand-600 hover:bg-brand-50'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="border-t border-brand-100 mt-2 pt-2 px-6 pb-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/orders" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-body text-dark">My Orders</Link>
                    <button onClick={() => { logout(); setMobileOpen(false) }} className="text-left py-2 text-sm font-body text-red-600">Log out</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-body text-brand-600 font-medium">Log in / Register</Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
