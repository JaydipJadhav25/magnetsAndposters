import { useEffect, useState } from "react";
import {
  FiChevronDown,
  FiExternalLink,
  FiSearch,
  FiDownload,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { formatPrice } from "../../utils/helpers";

const STATUS_OPTIONS = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const STATUS_COLORS = {
  placed: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-purple-100 text-purple-700 border-purple-200",
  shipped: "bg-orange-100 text-orange-700 border-orange-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [trackForm, setTrackForm] = useState({
    status: "",
    trackingNumber: "",
    courier: "",
    note: "",
  });

  const fetchOrders = () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : "";
    api
      .get(`/admin/orders${params}`)
      .then(({ data }) => {
        console.log("orders: ", orders);
        setOrders(data.orders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleUpdateStatus = async (orderId) => {
    if (!trackForm.status) {
      toast.error("Select a status");
      return;
    }
    setUpdating(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        status: trackForm.status,
        trackingNumber: trackForm.trackingNumber,
        courier: trackForm.courier,
        note: trackForm.note,
      });
      toast.success("Order status updated!");
      setExpanded(null);
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = search
    ? orders.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
          o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.guestEmail?.toLowerCase().includes(search.toLowerCase()),
      )
    : orders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-dark">Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5">{orders.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by order # or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm py-2"
          />
        </div>
        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("")}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${!filter ? "bg-dark text-cream border-dark" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
          >
            All
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border capitalize transition-colors ${filter === s ? STATUS_COLORS[s] : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          No orders found
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Order row */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpanded(expanded === order._id ? null : order._id)
                }
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono font-semibold text-dark text-sm">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-dark">
                      {order.user?.name || order.guestEmail || "Guest"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.items.length} item(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-dark text-sm">
                    {formatPrice(order.total)}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-500"}`}
                  >
                    {order.orderStatus}
                  </span>
                  <FiChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${expanded === order._id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {/* Expanded details */}
              {expanded === order._id && (
                <div className="border-t border-gray-100 px-5 py-5 space-y-5 bg-gray-50/50">
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Order items */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Items
                      </p>
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex gap-3 items-start bg-white rounded-lg p-3 border border-gray-100"
                          >
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  🧲
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-dark truncate">
                                {item.productName}
                              </p>
                              {item.variant && (
                                <p className="text-xs text-gray-400">
                                  Size: {item.variant}
                                </p>
                              )}
                              <p className="text-xs text-gray-400">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </p>
                              {/* Customer uploaded image */}
                              {/* {item.customImage?.url && (
                                <div className="mt-2 flex items-center gap-2">
                                  <img src={item.customImage.url} alt="Customer photo" className="w-10 h-10 rounded object-cover border-2 border-brand-200" />
                                  <div>
                                    <p className="text-xs text-brand-600 font-medium">Customer Photo</p>
                                    <a
                                      href={item.customImage.originalUrl || item.customImage.url}
                                      target="_blank" rel="noreferrer"
                                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                                    >
                                      <FiDownload size={10} /> Download Original (Full Res)
                                    </a>
                                  </div>
                                </div>
                              )} */}

                              {(item.customImages?.length > 0 ||
                                item.customImage?.url) && (
                                <div className="mt-2">
                                  <p className="text-xs text-brand-600 font-medium mb-1">
                                    Customer Photos
                                  </p>

                                  <div className="flex flex-wrap gap-2">
                                    {(item.customImages?.length > 0
                                      ? item.customImages
                                      : item.customImage
                                        ? [item.customImage]
                                        : []
                                    ).map((img, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-1"
                                      >
                                        <img
                                          src={img.url}
                                          alt="Customer"
                                          className="w-10 h-10 rounded object-cover border-2 border-brand-200"
                                        />

                                        <a
                                          href={img.originalUrl || img.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-600 hover:underline"
                                          title="Download"
                                        >
                                          <FiDownload size={12} />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-dark whitespace-nowrap">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Payment info */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Shipping Address
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm text-gray-600">
                          <p className="font-medium text-dark">
                            {order.shippingAddress?.fullName}
                          </p>
                          <p>
                            {order.shippingAddress?.line1}
                            {order.shippingAddress?.line2
                              ? `, ${order.shippingAddress.line2}`
                              : ""}
                          </p>
                          <p>
                            {order.shippingAddress?.city},{" "}
                            {order.shippingAddress?.state} –{" "}
                            {order.shippingAddress?.pincode}
                          </p>
                          <p className="text-brand-600 mt-1">
                            📱 {order.shippingAddress?.phone}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Payment
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span
                              className={`font-semibold ${order.paymentStatus === "paid" ? "text-green-600" : "text-red-500"}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total</span>
                            <span className="font-bold text-dark">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                          {order.razorpayPaymentId && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Payment ID</span>
                              <span className="font-mono text-xs text-gray-600">
                                {order.razorpayPaymentId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Update status */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Update Status
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-2">
                          <select
                            value={trackForm.status || order.orderStatus}
                            onChange={(e) =>
                              setTrackForm((f) => ({
                                ...f,
                                status: e.target.value,
                              }))
                            }
                            className="input-field text-sm py-2"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} className="capitalize">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Tracking number (optional)"
                            value={trackForm.trackingNumber}
                            onChange={(e) =>
                              setTrackForm((f) => ({
                                ...f,
                                trackingNumber: e.target.value,
                              }))
                            }
                            className="input-field text-sm py-2"
                          />
                          <input
                            type="text"
                            placeholder="Courier name (optional)"
                            value={trackForm.courier}
                            onChange={(e) =>
                              setTrackForm((f) => ({
                                ...f,
                                courier: e.target.value,
                              }))
                            }
                            className="input-field text-sm py-2"
                          />
                          <textarea
                            rows={2}
                            placeholder="Internal note (optional)"
                            value={trackForm.note}
                            onChange={(e) =>
                              setTrackForm((f) => ({
                                ...f,
                                note: e.target.value,
                              }))
                            }
                            className="input-field text-sm py-2 resize-none"
                          />
                          <button
                            onClick={() => handleUpdateStatus(order._id)}
                            disabled={updating === order._id}
                            className="btn-primary w-full py-2.5 text-sm"
                          >
                            {updating === order._id
                              ? "Updating…"
                              : "Update Order"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status history */}
                  {order.statusHistory?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Status History
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        {order.statusHistory.map((h, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-lg px-3 py-2 border border-gray-100 text-xs"
                          >
                            <p className="font-semibold text-dark capitalize">
                              {h.status}
                            </p>
                            <p className="text-gray-400">
                              {new Date(h.timestamp).toLocaleDateString(
                                "en-IN",
                              )}
                            </p>
                            {h.note && (
                              <p className="text-gray-500 mt-0.5">{h.note}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
