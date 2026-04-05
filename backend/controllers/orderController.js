const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * POST /api/orders — place a new order
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, guestEmail } = req.body;

    if (!items || !items.length)
      return res.status(400).json({ success: false, message: 'No items in order' });

    // Validate products and compute prices
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive)
        return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });

      // Find variant price
      let price = product.basePrice;
      if (item.variant) {
        const variant = product.variants.find((v) => v.size === item.variant);
        if (variant) price = variant.price;
      }

      const lineTotal = price * item.quantity;
      subtotal += lineTotal;

      processedItems.push({
        product:      product._id,
        productName:  product.name,
        productImage: product.images[0]?.url || '',
        variant:      item.variant || '',
        quantity:     item.quantity,
        price,
        customImage:  item.customImage || null,
      });
    }

    // Free shipping above ₹699
    const shipping = subtotal >= 699 ? 0 : 60;
    const total = subtotal + shipping;

    const order = await Order.create({
      user:            req.user?._id,
      guestEmail,
      items:           processedItems,
      subtotal,
      shipping,
      total,
      shippingAddress,
      paymentStatus:   'pending',
      orderStatus:     'placed',
      statusHistory:   [{ status: 'placed', note: 'Order created' }],
    });

    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

/**
 * GET /api/orders/my — user's orders
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images');
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

/**
 * GET /api/orders/:id — single order
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Allow owner or admin
    if (req.user && order.user && order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, order });
  } catch (err) { next(err); }
};
