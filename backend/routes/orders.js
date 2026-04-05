// routes/orders.js
const router = require('express').Router();
const { createOrder, getMyOrders, getOrder } = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/',       optionalAuth, createOrder);
router.get('/my',      protect, getMyOrders);
router.get('/:id',     optionalAuth, getOrder);

module.exports = router;
