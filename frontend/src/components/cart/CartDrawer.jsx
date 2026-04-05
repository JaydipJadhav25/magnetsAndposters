import { Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiX, FiTrash2, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { formatPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_COST, getShipping } from '../../utils/helpers'

export default function CartDrawer() {
  const { items, subtotal, itemCount, isOpen, setIsOpen, removeItem, updateQty } = useCart()
  console.log("all items : " , items);
  const navigate = useNavigate()
  const shipping  = getShipping(subtotal)
  const total     = subtotal + shipping

  const handleCheckout = () => {
    setIsOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-dark/50 cart-overlay z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-cream z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
          <h2 className="font-display text-xl font-semibold text-dark">
            Your Cart {itemCount > 0 && <span className="text-brand-600">({itemCount})</span>}
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:text-brand-600 transition-colors rounded-lg hover:bg-brand-50">
            <FiX size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <FiShoppingCart size={48} className="text-brand-200" />
              <div>
                <p className="font-display text-xl text-dark">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">Add some beautiful magnets!</p>
              </div>
              <Link to="/shop" onClick={() => setIsOpen(false)} className="btn-primary mt-2">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item, index) => (
                <li key={index} className="flex gap-4 bg-white rounded-xl p-3 shadow-sm">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🧲</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-semibold text-dark leading-snug line-clamp-2">{item.name}</p>
                    {item.variant && <p className="text-xs text-gray-500 mt-0.5">Size: {item.variant}</p>}
                    {item.customImage && (
                      <p className="text-xs text-brand-600 mt-0.5">📷 Custom photo uploaded</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {/* Qty control */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                        {/* <button
                          onClick={() => item.quantity > 1 ? updateQty(index, item.quantity - 1) : removeItem(index)}
                          className="text-dark hover:text-brand-600 transition-colors"
                        >
                          <FiMinus size={12} />
                        </button> */}
                        <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                        {/* <button
                          onClick={() => updateQty(index, item.quantity + 1)}
                          className="text-dark hover:text-brand-600 transition-colors"
                        >
                          <FiPlus size={12} />
                        </button> */}
                      </div>
                      <span className="font-semibold text-sm text-dark">{formatPrice(item.price * item.quantity)}</span>
                      {/* <span className="font-semibold text-sm text-dark">{formatPrice(item.price)}</span> */}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(index)}
                    className="self-start p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-brand-100 px-5 py-5 bg-white space-y-3">
            {/* Free shipping progress */}
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">
                  Add <span className="font-semibold text-brand-600">{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</span> more for free shipping!
                </p>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {subtotal >= FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-green-600 font-medium">🎉 You've unlocked free shipping!</p>
            )}

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-dark text-base pt-1.5 border-t border-gray-100">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full text-center">
              Proceed to Checkout
            </button>
            <Link to="/shop" onClick={() => setIsOpen(false)} className="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
