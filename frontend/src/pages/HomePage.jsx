import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiStar } from 'react-icons/fi'
import ProductCard from '../components/product/ProductCard'
import api from '../utils/api'

const HERO_TAGLINES = [
  'Where Memories Stick',
  'Your Story, On Your Fridge',
  'The Perfect Little Keepsake',
]

export default function HomePage() {
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tagline,   setTagline]   = useState(0)

  useEffect(() => {
    api.get('/products?featured=true&limit=8')
      .then(({ data }) => setProducts(data.products))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Rotate taglines
  useEffect(() => {
    const id = setInterval(() => setTagline((t) => (t + 1) % HERO_TAGLINES.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-brand-50">
        {/* Decorative background circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-brand-300/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="text-center lg:text-left animate-fade-up">
            <p className="font-accent italic text-brand-600 text-lg mb-3 tracking-wide">
              Custom Photo Magnets &amp; Posters
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-dark leading-tight">
              {HERO_TAGLINES[tagline]}
            </h1>
            <p className="mt-6 text-gray-600 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
              Turn your favourite memories into beautiful custom photo magnets — the perfect little keepsake for your home or a heartfelt gift.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
                Shop All <FiArrowRight size={18} />
              </Link>
              <Link to="/shop/photo-magnet" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-4">
                Photo Magnets
              </Link>
            </div>
            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-5 justify-center lg:justify-start text-sm text-gray-500">
              {['Free shipping ₹699+', 'High-quality print', 'Secure Razorpay checkout'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />{t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero image mosaic */}
          <div className="relative grid grid-cols-2 gap-3 max-w-sm mx-auto lg:max-w-none animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="col-span-2 rounded-2xl overflow-hidden aspect-[16/9] bg-brand-100 shadow-lg">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                <div className="text-center p-6">
                  <div className="text-6xl mb-3">🧲</div>
                  <p className="font-display text-xl text-brand-800">Your Photo Here</p>
                  <p className="text-sm text-brand-600 mt-1">Upload any memory</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square bg-brand-200/60 shadow-md flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">📸</div>
                <p className="font-body text-xs text-brand-700 font-medium">Photo Magnet</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square bg-brand-300/40 shadow-md flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">✨</div>
                <p className="font-body text-xs text-brand-700 font-medium">Quote Magnet</p>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-full shadow-lg px-4 py-3 flex items-center gap-2 border border-brand-100">
              <div className="flex">
                {[1,2,3,4,5].map((s) => <FiStar key={s} size={12} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <span className="text-xs font-semibold text-dark">500+ happy customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-accent italic text-brand-600 mb-2">Handpicked for you</p>
          <h2 className="section-title">Featured Products</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/shop" className="btn-secondary inline-flex items-center gap-2">
            View All Products <FiArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-50 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="text-gray-500 mt-3">Order your custom magnet in 3 easy steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📸', title: 'Choose & Upload', desc: 'Pick your favourite photo or quote magnet and upload your image.' },
              { step: '02', icon: '🎨', title: 'We Print & Pack', desc: 'We print your magnet at full resolution with premium quality materials.' },
              { step: '03', icon: '🚀', title: 'Delivered to You', desc: 'Your magnet arrives safely at your doorstep within 5–7 business days.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center relative">
                <div className="w-16 h-16 bg-brand-600 text-cream rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-md">
                  {icon}
                </div>
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-xs font-bold text-brand-400 tracking-widest">{step}</span>
                <h3 className="font-display text-lg font-semibold text-dark mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="section-title text-center mb-10">Shop by Category</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { label: 'Photo Magnets',  sub: 'Upload your own photo',      to: '/shop/photo-magnet',  emoji: '📸', bg: 'from-brand-100 to-brand-200' },
            { label: 'Quote Magnets',  sub: 'Beautiful motivational art',  to: '/shop/quote-magnet',  emoji: '✨', bg: 'from-amber-100 to-orange-100' },
          ].map(({ label, sub, to, emoji, bg }) => (
            <Link key={to} to={to} className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className={`bg-gradient-to-br ${bg} p-10 md:p-14 flex flex-col items-start gap-3`}>
                <span className="text-5xl">{emoji}</span>
                <div>
                  <h3 className="font-display text-2xl font-bold text-dark group-hover:text-brand-700 transition-colors">{label}</h3>
                  <p className="text-gray-500 text-sm mt-1">{sub}</p>
                </div>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 group-hover:gap-3 transition-all">
                  Shop Now <FiArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-dark px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-cream mb-10">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya M.',    quote: 'Got photo magnets for my birthday and they look absolutely stunning. The quality is amazing!', rating: 5 },
              { name: 'Rohan K.',   quote: 'Ordered for my parents anniversary. They were so touched. Perfect gift, fast delivery!', rating: 5 },
              { name: 'Sneha T.',   quote: 'The quote magnets are so pretty. Ordered 3 sets and gifted them at a wedding. Everyone loved it!', rating: 5 },
            ].map(({ name, quote, rating }) => (
              <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
                <div className="flex mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <FiStar key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-cream/80 text-sm leading-relaxed italic">"{quote}"</p>
                <p className="text-cream/50 text-xs font-semibold mt-3">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
