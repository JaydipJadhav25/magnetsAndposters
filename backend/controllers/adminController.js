const Order = require('../models/Order');
const User  = require('../models/User');
const Product = require('../models/Product');
const { sendEmailToUserUpdateStatus } = require('../utils/SendMail');

/**
 * GET /api/admin/dashboard
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders] = await Promise.all([
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Order.find({ paymentStatus: 'paid' }).sort({ createdAt: -1 }).limit(10).populate('user', 'name email'),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts,
        totalUsers,
      },
      recentOrders,
    });
  } catch (err) { next(err); }
};

/**
 * GET /api/admin/orders
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'name email'),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/**
 * PUT /api/admin/orders/:id/status
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber, courier } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courier) order.courier = courier;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

    await order.save();
    
  //    to,
  // name = "User",
  // orderId,
  // orderStatus,

   await sendEmailToUserUpdateStatus(order.guestEmail , order.shippingAddress.fullName , order._id , status);
 

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

/**
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { next(err); }
};
