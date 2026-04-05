import { Link } from 'react-router-dom'
import { FiShoppingCart } from 'react-icons/fi'
import { formatPrice } from '../../utils/helpers'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0]
  const hasDiscount   = product.variants?.[0]?.mrp && product.variants[0].mrp > product.basePrice

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (product.requiresCustomImage) return // redirect to product page
    addItem({
      productId:   product._id,
      name:        product.name,
      slug:        product.slug,
      image:       primaryImage?.url || '',
      variant:     product.variants?.[0]?.size || '',
      price:       product.basePrice,
      quantity:    1,
    })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-50">
              <span className="text-brand-300 text-4xl">🧲</span>
            </div>
          )}
          {/* Sale badge */}
          {hasDiscount && (
            <span className="badge-sale absolute top-3 left-3">Sale</span>
          )}
          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
            <button
              onClick={handleAddToCart}
              className="w-full bg-dark/90 backdrop-blur-sm text-cream text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-dark transition-colors"
            >
              <FiShoppingCart size={15} />
              {product.requiresCustomImage ? 'Choose Options' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display text-base font-semibold text-dark leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-dark font-semibold text-sm">
              {product.variants?.length > 1 ? 'From ' : ''}{formatPrice(product.basePrice)}
            </span>
            {hasDiscount && (
              <span className="text-gray-400 line-through text-xs">
                {formatPrice(product.variants[0].mrp)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
