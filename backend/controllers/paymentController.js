const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for the given amount
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentStatus === 'paid')
      return res.status(400).json({ success: false, message: 'Order already paid' });

    // Amount in paise (₹ * 100)
    const amount = Math.round(order.total * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId:     order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    // Save Razorpay order ID to our order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) { next(err); }
};

/**
 * POST /api/payments/verify
 * Verifies Razorpay signature and confirms the order
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // ── Signature verification ────────────────────────────────────────────────
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // ── Update order ──────────────────────────────────────────────────────────
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus      = 'paid';
    order.orderStatus        = 'confirmed';
    order.razorpayPaymentId  = razorpay_payment_id;
    order.razorpaySignature  = razorpay_signature;
    order.statusHistory.push({ status: 'confirmed', note: 'Payment received via Razorpay' });
    await order.save();

    res.json({ success: true, message: 'Payment verified', orderNumber: order.orderNumber });
  } catch (err) { next(err); }
};
