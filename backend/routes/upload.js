const router = require('express').Router();
const { uploadCustomerImage, getOriginalUrl } = require('../config/cloudinary');

/**
 * POST /api/upload/customer-image
 * Uploads a customer's photo for custom magnets.
 * Returns publicId + url (display) + originalUrl (full-res for printing)
 */
router.post('/customer-image', uploadCustomerImage.single('image'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { filename, path: url, originalname } = req.file;
    const originalUrl = getOriginalUrl(filename);

    res.json({
      success: true,
      image: {
        publicId:    filename,
        url,           // Cloudinary display URL
        originalUrl,   // Full-res URL — preserved for printing
        fileName:    originalname,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
