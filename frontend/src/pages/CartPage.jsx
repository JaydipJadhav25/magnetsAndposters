import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { formatPrice, getShipping, FREE_SHIPPING_THRESHOLD } from '../utils/helpers'

export default function CartPage() {
  const { items, subtotal, removeItem, updateQty } = useCart()
  const navigate = useNavigate()
  const shipping = getShipping(subtotal)
  const total    = subtotal + shipping

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-7xl mb-6">🛒</div>
      <h2 className="font-display text-3xl font-bold text-dark mb-3">Your cart is empty</h2>
      <p className="text-gray-500 mb-8">Looks like you haven't added anything yet!</p>
      <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
        <FiArrowLeft size={16} /> Continue Shopping
      </Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="section-title mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <div key={index} className="card p-4 flex gap-4">
              {/* Image */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl">🧲</div>
                }
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-dark">{item.name}</h3>
                    {item.variant && <p className="text-sm text-gray-500 mt-0.5">Size: {item.variant}</p>}
                    {item.customImage && (
                      <div className="mt-1 flex items-center gap-2">
                        <img src={item.customImage.url} alt="custom" className="w-8 h-8 rounded object-cover border border-brand-200" />
                        <span className="text-xs text-brand-600">Custom photo</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <FiTrash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-1.5">
                    <button onClick={() => item.quantity > 1 ? updateQty(index, item.quantity - 1) : removeItem(index)}
                      className="text-dark hover:text-brand-600 transition-colors">
                      <FiMinus size={13} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(index, item.quantity + 1)}
                      className="text-dark hover:text-brand-600 transition-colors">
                      <FiPlus size={13} />
                    </button>
                  </div>
                  <span className="font-bold text-dark">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}

          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium mt-2">
            <FiArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl font-semibold text-dark mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium text-dark">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium text-dark'}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-brand-600 bg-brand-50 rounded-lg px-3 py-2">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping!
                </p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-dark text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mt-6 text-base py-4"
            >
              Proceed to Checkout
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>🔒</span> Secure checkout via Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
