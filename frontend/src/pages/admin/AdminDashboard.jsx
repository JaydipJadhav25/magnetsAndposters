import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiPackage, FiUsers, FiDollarSign, FiArrowRight } from 'react-icons/fi'
import api from '../../utils/api'
import { formatPrice } from '../../utils/helpers'

const STATUS_COLORS = {
  placed:     'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-orange-100 text-orange-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => {
        setStats(data.stats)
        setOrders(data.recentOrders)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = stats ? [
    { label: 'Total Orders',    value: stats.totalOrders,                     icon: FiShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Revenue',   value: formatPrice(stats.totalRevenue),        icon: FiDollarSign,  color: 'bg-green-50 text-green-600' },
    { label: 'Active Products', value: stats.totalProducts,                    icon: FiPackage,     color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Users',     value: stats.totalUsers,                       icon: FiUsers,       color: 'bg-orange-50 text-orange-600' },
  ] : []

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-dark">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Admin</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-dark">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display text-lg font-semibold text-dark">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No orders yet</td></tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-medium text-dark">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {order.user?.name || order.guestEmail || 'Guest'}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{order.items.length} item(s)</td>
                  <td className="px-5 py-3 font-semibold text-dark">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
