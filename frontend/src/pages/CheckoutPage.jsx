import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice, getShipping } from '../utils/helpers'
import api from '../utils/api'
import { useForm } from 'react-hook-form'

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

  const [loading, setLoading] = useState(false)

  //  React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    }
  })

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-display text-2xl font-bold text-dark mb-4">Your cart is empty</h2>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  const handlePlaceOrder = async (data) => {
    setLoading(true)
    //  if (data) {
    //   console.log("FORM DATA:", data)
    //   return;
    //  }

      console.log("FORM DATA:", data)

      
    try {
      const orderPayload = {
  
        items: items.map((i) => ({
          productId: i.productId,
          variant: i.variant,
          quantity: i.quantity,
          customImages: i.customImages || [],
        })),

        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
        guestEmail: !user ? data.email : undefined,
      }

      const { data: orderData } = await api.post('/orders', orderPayload)
      const orderId = orderData.order._id

      const { data: rzpData } = await api.post('/payments/create-order', { orderId })

      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded')
        setLoading(false)
        return
      }

      const rzp = new window.Razorpay({
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'magnetAndPosters',
        description: 'Custom Magnets & Posters',
        order_id: rzpData.razorpayOrderId,
        prefill: {
          name: data.fullName,
          email: data.email,
          contact: data.phone,
        },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
              name: data?.fullName || " ",
              email: data?.email || "",
            })
            clearCart()
            navigate(`/order-success/${orderId}`)
          } catch {
            toast.error('Payment verification failed')
          }
        },
      })

      rzp.open()
    } catch (err) {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  //  UPDATED Field (RHF CONNECTED, UI SAME)
  const Field = ({ name, label, type = 'text', required, as, children, half, validation }) => (
    <div className={half ? 'sm:col-span-1' : 'sm:col-span-2'}>
      <label className="block text-sm font-medium text-dark mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {as === 'select' ? (
        <select
          {...register(name, validation)}
          className={`input-field ${errors[name] ? 'border-red-400' : ''}`}
        >
          <option value="">Select {label}</option>
          {children}
        </select>
      ) : (
        <input
          type={type}
          {...register(name, validation)}
          className={`input-field ${errors[name] ? 'border-red-400' : ''}`}
        />
      )}

      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors">
        <FiArrowLeft size={14} /> Back to Cart
      </Link>

      <h1 className="section-title mb-8">Checkout</h1>

    
        
        <form onSubmit={handleSubmit(handlePlaceOrder)} className="grid lg:grid-cols-3 gap-10">

           {/* FORM */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold text-dark mb-5">Shipping Address</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field name="fullName" label="Full Name" required half validation={{ required: 'Name is required' }} />
              <Field name="phone" label="Phone Number" required half validation={{
                required: 'Phone required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone' }
              }} />
              <Field name="email" label="Email Address" type="email" required validation={{
                required: 'Email required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' }
              }} />
              <Field name="line1" label="Address Line 1" required validation={{ required: 'Address required' }} />
              <Field name="line2" label="Address Line 2 (optional)" />
              <Field name="city" label="City" required half validation={{ required: 'City required' }} />

              <Field name="state" label="State" as="select" required validation={{ required: 'State required' }}>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Field>

              <Field name="pincode" label="Pincode" required half validation={{
                required: 'Pincode required',
                pattern: { value: /^\d{6}$/, message: 'Invalid pincode' }
              }} />
            </div>
          </div>
        </div>

        {/* SUMMARY */}
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
                  {/* <span className="text-sm font-semibold text-dark">{formatPrice(item.price * item.quantity)}</span> */}
                  <span className="text-sm font-semibold text-dark">{formatPrice(item.price)}</span>
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
              // onClick={handlePlaceOrder}
              type="submit"
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

        </form>
       
      </div>
    
  )
}