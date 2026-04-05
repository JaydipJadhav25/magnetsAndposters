import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice, getShipping } from '../utils/helpers'
import api from '../utils/api'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
]

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate  = useNavigate()

  const shipping = getShipping(subtotal)
  const total    = subtotal + shipping

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone:    user?.phone || '',
    email:    user?.email || '',
    line1:    '',
    line2:    '',
    city:     '',
    state:    '',
    pincode:  '',
  })
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-display text-2xl font-bold text-dark mb-4">Your cart is empty</h2>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Name is required'
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Valid 10-digit phone required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.line1.trim()) e.line1 = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state) e.state = 'State is required'
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors((er) => ({ ...er, [e.target.name]: '' }))
  }

  const handlePlaceOrder = async () => {
    if (!validate()) return
    setLoading(true)

    try {
      // 1. Create order in our backend
      const orderPayload = {
        items: items.map((i) => ({
          productId:   i.productId,
          variant:     i.variant,
          quantity:    i.quantity,
          customImage: i.customImage || null,
        })),
        shippingAddress: {
          fullName: form.fullName,
          phone:    form.phone,
          line1:    form.line1,
          line2:    form.line2,
          city:     form.city,
          state:    form.state,
          pincode:  form.pincode,
        },
        guestEmail: !user ? form.email : undefined,
      }

      const { data: orderData } = await api.post('/orders', orderPayload)
      const orderId = orderData.order._id

      // 2. Create Razorpay order
      const { data: rzpData } = await api.post('/payments/create-order', { orderId })

      // 3. Open Razorpay checkout
      const options = {
        key:         rzpData.keyId,
        amount:      rzpData.amount,
        currency:    rzpData.currency,
        name:        'magnetAndPosters',
        description: 'Custom Magnets & Posters',
        order_id:    rzpData.razorpayOrderId,
        prefill: {
          name:    form.fullName,
          email:   form.email,
          contact: form.phone,
        },
        theme: { color: '#b5661f' },
        handler: async (response) => {
          try {
            // 4. Verify payment
            await api.post('/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId,
            })
            clearCart()
            navigate(`/order-success/${orderId}`)
          } catch {
            toast.error('Payment verification failed. Contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast('Payment cancelled. Your order is saved.')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.')
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const Field = ({ name, label, type = 'text', required, as, children, half }) => (
    <div className={half ? 'sm:col-span-1' : 'sm:col-span-2'}>
      <label className="block text-sm font-medium text-dark mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {as === 'select' ? (
        <select name={name} value={form[name]} onChange={handleChange} className={`input-field ${errors[name] ? 'border-red-400' : ''}`}>
          <option value="">Select {label}</option>
          {children}
        </select>
      ) : (
        <input type={type} name={name} value={form[name]} onChange={handleChange}
          className={`input-field ${errors[name] ? 'border-red-400' : ''}`} />
      )}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <FiArrowLeft size={14} /> Back to Cart
      </Link>

      <h1 className="section-title mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Address form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold text-dark mb-5">Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field name="fullName" label="Full Name" required half />
              <Field name="phone"    label="Phone Number" required half />
              <Field name="email"    label="Email Address" type="email" required />
              <Field name="line1"    label="Address Line 1" required />
              <Field name="line2"    label="Address Line 2 (optional)" />
              <Field name="city"    label="City" required half />
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-dark mb-1">State <span className="text-red-500">*</span></label>
                <select name="state" value={form.state} onChange={handleChange}
                  className={`input-field ${errors.state ? 'border-red-400' : ''}`}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
              <Field name="pincode" label="Pincode" required half />
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl font-semibold text-dark mb-4">Order Summary</h2>

            <ul className="divide-y divide-gray-100 mb-4">
              {items.map((item, i) => (
                <li key={i} className="py-3 flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🧲</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark truncate">{item.name}</p>
                    {item.variant && <p className="text-xs text-gray-400">Size: {item.variant}</p>}
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-dark">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-dark text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary w-full mt-6 text-base py-4 flex items-center justify-center gap-2"
            >
              <FiLock size={16} />
              {loading ? 'Processing…' : `Pay ${formatPrice(total)}`}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              🔒 Secured by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
