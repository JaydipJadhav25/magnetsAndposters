const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size:     { type: String, required: true },   // e.g. "2x2", "3x3", "4x4"
  price:    { type: Number, required: true },
  mrp:      { type: Number },                   // original price for sale display
  inStock:  { type: Boolean, default: true },
  sku:      { type: String },
});

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category:    {
      type: String,
      enum: ['photo-magnet', 'quote-magnet', 'poster', 'bundle'],
      required: true,
    },
    images: [
      {
        publicId:    String,   // Cloudinary public_id (for original-quality access)
        url:         String,   // Display URL
        originalUrl: String,   // Full-resolution URL (no compression)
        alt:         String,
        isPrimary:   { type: Boolean, default: false },
      },
    ],
    variants:    [variantSchema],
    basePrice:   { type: Number, required: true },    // minimum price shown
    requiresCustomImage: { type: Boolean, default: false }, // for photo magnets
    tags:        [String],
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    totalSold:   { type: Number, default: 0 },
    rating:      { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Product', productSchema);
