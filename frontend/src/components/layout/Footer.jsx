import { Link } from 'react-router-dom'
import { FiInstagram, FiYoutube } from 'react-icons/fi'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success('Thank you for subscribing!')
    setEmail('')
  }

  return (
    <footer className="bg-dark text-cream/80 font-body">
      {/* Contact strip */}
      <div className="bg-brand-700 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-display text-2xl text-cream mb-2">Contact Us</h3>
          <p className="text-cream/80 mb-4 text-sm leading-relaxed">
            Have a question? Contact us via WhatsApp and our support team will help you out.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919025926436'}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp
            </a>
            <a href="mailto:hello.magnetandposters@gmail.com" className="text-cream/80 hover:text-cream transition-colors">
              hello.magnetandposters@gmail.com
            </a>
          </div>
          <p className="text-cream/60 text-xs mt-4">
            Monday–Friday, 10am–5pm IST (except public holidays)
          </p>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-white/10 py-10 px-4">
        <div className="max-w-md mx-auto text-center">
          <h3 className="font-display text-xl text-cream mb-1">Subscribe to our emails</h3>
          <p className="text-sm text-cream/60 mb-4">Be the first to know about new collections and exclusive offers.</p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-brand-400"
            />
            <button type="submit" className="btn-primary text-sm px-5 py-2.5 rounded-lg whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Links + social */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-display text-xl font-bold text-cream">
              magnet<span className="text-brand-400">&</span>Posters
            </span>
            <p className="mt-3 text-sm text-cream/60 leading-relaxed">
              Turn your memories into beautiful keepsakes. Custom photo magnets crafted with love, delivered to your door.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-cream/60 hover:text-brand-400 transition-colors"><FiInstagram size={20} /></a>
              <a href="https://youtube.com"   target="_blank" rel="noreferrer" className="text-cream/60 hover:text-brand-400 transition-colors"><FiYoutube size={20} /></a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="text-cream/60 hover:text-brand-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Shop All',     to: '/shop' },
                { label: 'Photo Magnet', to: '/shop/photo-magnet' },
                { label: 'Quote Magnet', to: '/shop/quote-magnet' },
                { label: 'Bulk Orders',  to: '/bulk-orders' },
                { label: 'About Us',     to: '/about' },
                { label: 'Contact',      to: '/contact' },
              ].map((l) => (
                <li key={l.to}><Link to={l.to} className="text-cream/60 hover:text-cream transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Shipping Policy',  to: '/shipping-policy' },
                { label: 'Refund Policy',    to: '/refund-policy' },
                { label: 'Terms & Conditions', to: '/terms' },
                { label: 'Privacy Policy',   to: '/privacy' },
              ].map((l) => (
                <li key={l.to}><Link to={l.to} className="text-cream/60 hover:text-cream transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/40">
          <p>© {new Date().getFullYear()} magnetAndPosters. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Secure payments via</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-cream/60 font-semibold">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
