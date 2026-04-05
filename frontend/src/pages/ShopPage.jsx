import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { FiFilter, FiSearch } from 'react-icons/fi'
import ProductCard from '../components/product/ProductCard'
import api from '../utils/api'

const CATEGORIES = [
  { value: '',             label: 'All Products' },
  { value: 'photo-magnet', label: 'Photo Magnet' },
  { value: 'quote-magnet', label: 'Quote Magnet' },
  { value: 'poster',       label: 'Poster' },
  { value: 'bundle',       label: 'Bundle' },
]

export default function ShopPage() {
  const { category: paramCategory } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState(searchParams.get('q') || '')
  const [category,  setCategory]  = useState(paramCategory || searchParams.get('category') || '')
  const [total,     setTotal]     = useState(0)

  useEffect(() => {
    setCategory(paramCategory || '')
  }, [paramCategory])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search)   params.set('search', search)
    params.set('limit', '20')

    api.get(`/products?${params}`)
      .then(({ data }) => { setProducts(data.products); setTotal(data.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category, search])

  const handleSearch = (e) => {
    e.preventDefault()
    const val = e.target.querySelector('input').value.trim()
    setSearch(val)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">
          {CATEGORIES.find((c) => c.value === category)?.label || 'All Products'}
        </h1>
        <p className="text-gray-500 mt-1">{total} products</p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              defaultValue={search}
              placeholder="Search products…"
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap
                ${category === value
                  ? 'bg-brand-600 border-brand-600 text-cream'
                  : 'border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🧲</p>
          <h3 className="font-display text-xl font-semibold text-dark mb-2">No products found</h3>
          <p className="text-gray-500">Try a different category or search term.</p>
          <button onClick={() => { setCategory(''); setSearch('') }} className="btn-primary mt-6">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  )
}
