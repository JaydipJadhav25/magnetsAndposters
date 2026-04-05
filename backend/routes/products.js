const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadProductImage } = require('../config/cloudinary');

router.get('/',     getProducts);
router.get('/:slug', getProduct);

// Admin only
router.post('/',    protect, adminOnly, uploadProductImage.array('images', 10), createProduct);
router.put('/:id',  protect, adminOnly, uploadProductImage.array('images', 10), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
