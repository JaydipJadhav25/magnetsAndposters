const router = require('express').Router();
const { getDashboard, getAllOrders, updateOrderStatus, getAllUsers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard',          getDashboard);
router.get('/orders',             getAllOrders);
router.put('/orders/:id/status',  updateOrderStatus);
router.get('/users',              getAllUsers);

module.exports = router;
