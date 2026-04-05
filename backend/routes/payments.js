const router = require('express').Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/auth');

router.post('/create-order', optionalAuth, createRazorpayOrder);
router.post('/verify',       optionalAuth, verifyPayment);

module.exports = router;
