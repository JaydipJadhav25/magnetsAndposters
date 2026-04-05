const Product = require('../models/Product');
const { cloudinary, getOriginalUrl, getDisplayUrl } = require('../config/cloudinary');

/**
 * GET /api/products — list with filters
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { category, featured, search, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/**
 * GET /api/products/:slug
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

/**
 * POST /api/products  (admin)
 */
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, category, variants, requiresCustomImage, tags, isFeatured, basePrice } = req.body;

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existingSlug = await Product.findOne({ slug });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const images = [];
    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        const f = req.files[i];
        images.push({
          publicId:    f.filename,
          url:         f.path,
          originalUrl: getOriginalUrl(f.filename),
          alt:         name,
          isPrimary:   i === 0,
        });
      }
    }

    const product = await Product.create({
      name,
      slug: finalSlug,
      description,
      category,
      basePrice: Number(basePrice),
      variants: typeof variants === 'string' ? JSON.parse(variants) : variants,
      requiresCustomImage: requiresCustomImage === 'true' || requiresCustomImage === true,
      tags: typeof tags === 'string' ? JSON.parse(tags) : (tags || []),
      isFeatured: isFeatured === 'true' || isFeatured === true,
      images,
    });

    res.status(201).json({ success: true, product });
  } catch (err) { next(err); }
};

/**
 * PUT /api/products/:id  (admin)
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.variants && typeof updates.variants === 'string') updates.variants = JSON.parse(updates.variants);
    if (updates.tags && typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);

    if (req.files && req.files.length) {
      const newImages = req.files.map((f, i) => ({
        publicId: f.filename,
        url: f.path,
        originalUrl: getOriginalUrl(f.filename),
        alt: updates.name || '',
        isPrimary: i === 0,
      }));
      updates.$push = { images: { $each: newImages } };
      delete updates.images;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, product });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/products/:id  (admin)
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Remove images from Cloudinary
    for (const img of product.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};
