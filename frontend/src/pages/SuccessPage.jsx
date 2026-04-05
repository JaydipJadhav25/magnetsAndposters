import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiCheck, FiPackage, FiArrowRight } from 'react-icons/fi'
import api from '../utils/api'
import { formatPrice } from '../utils/helpers'

export default function SuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiCheck size={40} className="text-green-600" strokeWidth={3} />
      </div>

      <h1 className="font-display text-4xl font-bold text-dark mb-2">Order Placed!</h1>
      <p className="text-gray-500 text-lg mb-2">Thank you for your order 🎉</p>
      {order && (
        <p className="text-sm text-brand-600 font-semibold mb-8">Order #{order.orderNumber}</p>
      )}

      {order && (
        <div className="card p-6 text-left mb-8">
          <h2 className="font-display text-lg font-semibold text-dark mb-4 flex items-center gap-2">
            <FiPackage size={18} className="text-brand-600" /> Order Details
          </h2>
          <ul className="space-y-3 mb-5">
            {order.items.map((item, i) => (
              <li key={i} className="flex gap-3 items-center py-2 border-b border-gray-50 last:border-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  {item.productImage
                    ? <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">🧲</div>
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-dark">{item.productName}</p>
                  {item.variant && <p className="text-xs text-gray-400">Size: {item.variant} · Qty: {item.quantity}</p>}
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-dark text-base pt-2 border-t border-gray-100">
              <span>Total Paid</span><span className="text-brand-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Shipping address */}
      {order?.shippingAddress && (
        <div className="card p-5 text-left mb-8">
          <h3 className="font-semibold text-dark text-sm mb-2">Delivering to:</h3>
          <p className="text-sm text-gray-600">
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
          </p>
        </div>
      )}

      <div className="bg-brand-50 rounded-xl p-5 mb-8 text-sm text-gray-600">
        <p>📦 Your order is being processed. You'll receive a confirmation shortly.</p>
        <p className="mt-1">Expected delivery: <strong>5–7 business days</strong></p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/orders" className="btn-primary inline-flex items-center gap-2">
          Track My Orders <FiArrowRight size={15} />
        </Link>
        <Link to="/shop" className="btn-secondary inline-flex items-center gap-2">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
