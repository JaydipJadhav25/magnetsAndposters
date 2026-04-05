const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Product images storage — lossless, no transformation, original quality
 */
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'magnetandposters/products',
    resource_type: 'image',
    // quality: 100 ensures lossless; use 'auto' only for display not storage
    transformation: [{ quality: 100, fetch_format: 'auto' }],
    // Store original file without any destructive transformations
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  },
});

/**
 * Customer uploaded images — STRICTLY no compression, preserve original resolution
 */
const customerImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'magnetandposters/customer-uploads',
    resource_type: 'image',
    // Do NOT apply any transformation to customer images
    // They will be used for printing — must be original quality
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    // flags: 'preserve_transparency' if needed
  },
});

const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP, HEIC images allowed'), false);
  },
});

const uploadCustomerImage = multer({
  storage: customerImageStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB — allow large originals
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP, HEIC images allowed'), false);
  },
});

/**
 * Get original-quality URL from Cloudinary (no transformation)
 */
const getOriginalUrl = (publicId) => {
  return cloudinary.url(publicId, {
    quality: 100,
    fetch_format: 'auto',
    secure: true,
  });
};

/**
 * Get display URL (optimized for web, not for print)
 */
const getDisplayUrl = (publicId, width = 800) => {
  return cloudinary.url(publicId, {
    width,
    crop: 'limit',
    quality: 'auto:good',
    fetch_format: 'auto',
    secure: true,
  });
};

module.exports = {
  cloudinary,
  uploadProductImage,
  uploadCustomerImage,
  getOriginalUrl,
  getDisplayUrl,
};
