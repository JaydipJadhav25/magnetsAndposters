const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:  String,
  productImage: String,
  variant:      String,   // size e.g. "2x2"
  quantity:     { type: Number, required: true, min: 1 },
  price:        { type: Number, required: true },

  // Customer uploaded image (for photo magnets) — store public_id for original access
  customImage: {
    publicId:    String,
    url:         String,
    originalUrl: String,  // Full-res, used by admin for printing
    fileName:    String,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Guest checkout support
    guestEmail: String,

    items:    [orderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total:    { type: Number, required: true },

    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      line1:    { type: String, required: true },
      line2:    String,
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'razorpay' },

    // Razorpay fields
    razorpayOrderId:   String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },

    trackingNumber: String,
    courier:        String,
    notes:          String,

    statusHistory: [
      {
        status:    String,
        timestamp: { type: Date, default: Date.now },
        note:      String,
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `MAP${String(count + 1001).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
