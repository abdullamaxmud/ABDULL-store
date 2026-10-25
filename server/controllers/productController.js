const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Escapes special regex characters to prevent Regular Expression Denial of Service (ReDoS)
 * @param {string} str - User-supplied search string
 * @returns {string} Sanitized string safe for new RegExp
 */
const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @desc    Get paginated, filtered, searched and sorted products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const rawPage = parseInt(req.query.page, 10);
    const rawLimit = parseInt(req.query.limit, 10);
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 12;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    // Search query with safe regex escaping to prevent ReDoS
    if (req.query.keyword && typeof req.query.keyword === 'string') {
      const safeKeyword = escapeRegex(req.query.keyword.trim().slice(0, 80));
      if (safeKeyword) {
        const keywordRegex = new RegExp(safeKeyword, 'i');
        query.$or = [
          { name: keywordRegex },
          { brand: keywordRegex },
          { sku: keywordRegex },
          { description: keywordRegex },
        ];
      }
    }

    // Category filter
    if (req.query.category && typeof req.query.category === 'string') {
      const catParam = req.query.category.trim();
      if (mongoose.Types.ObjectId.isValid(catParam)) {
        query.category = catParam;
      } else {
        const safeSlug = catParam.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const foundCategory = await Category.findOne({ slug: safeSlug });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }
    }

    // Brand filter with safe regex
    if (req.query.brand && typeof req.query.brand === 'string') {
      const safeBrand = escapeRegex(req.query.brand.trim().slice(0, 60));
      if (safeBrand) {
        query.brand = new RegExp(`^${safeBrand}$`, 'i');
      }
    }

    // Price range filter with strict finite number checks
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);

    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
      query.price = {};
      if (Number.isFinite(minPrice) && minPrice >= 0) {
        query.price.$gte = minPrice;
      }
      if (Number.isFinite(maxPrice) && maxPrice >= 0) {
        query.price.$lte = maxPrice;
      }
    }

    // Rating filter
    const minRating = parseFloat(req.query.rating);
    if (Number.isFinite(minRating) && minRating >= 1 && minRating <= 5) {
      query.rating = { $gte: minRating };
    }

    // In Stock filter
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Discount deals filter
    if (req.query.hasDiscount === 'true') {
      query.discountPrice = { $gt: 0 };
    }

    // Sorting whitelist
    let sort = { createdAt: -1 };
    switch (req.query.sort) {
      case 'price-asc':
        sort = { price: 1 };
        break;
      case 'price-desc':
        sort = { price: -1 };
        break;
      case 'popular':
        sort = { soldCount: -1 };
        break;
      case 'top-rated':
        sort = { rating: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    if (!rawId || typeof rawId !== 'string') {
      res.status(400);
      throw new Error('Product identifier is required');
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(rawId);
    const query = isObjectId ? { _id: rawId } : { slug: rawId.trim().toLowerCase() };

    const product = await Product.findOne(query).populate('category', 'name slug');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products for homepage
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .limit(8);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get flash deals (discounted items)
 * @route   GET /api/products/deals
 * @access  Public
 */
const getFlashDeals = async (req, res, next) => {
  try {
    const products = await Product.find({
      isActive: true,
      discountPrice: { $gt: 0 },
    })
      .populate('category', 'name slug')
      .sort({ discountPrice: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get top selling / trending products
 * @route   GET /api/products/trending
 * @access  Public
 */
const getTrendingProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ soldCount: -1, rating: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get new arrivals
 * @route   GET /api/products/new-arrivals
 * @access  Public
 */
const getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get related products by category
 * @route   GET /api/products/:id/related
 * @access  Public
 */
const getRelatedProducts = async (req, res, next) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error('Invalid product ID');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate('category', 'name slug')
      .limit(4);

    res.status(200).json({
      success: true,
      data: related,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      brand,
      images,
      stock,
      sku,
      specifications,
      colors,
      sizes,
      isFeatured,
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400);
      throw new Error('Please provide a valid product name');
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400);
      throw new Error('Please provide a valid product description');
    }

    const parsedPrice = parseFloat(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      res.status(400);
      throw new Error('Please provide a valid non-negative product price');
    }

    const parsedDiscount = discountPrice !== undefined ? parseFloat(discountPrice) : 0;
    if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0) {
      res.status(400);
      throw new Error('Discount price must be a valid non-negative number');
    }

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      res.status(400);
      throw new Error('Please provide a valid category ID');
    }

    if (!Array.isArray(images) || images.length === 0) {
      res.status(400);
      throw new Error('Please provide at least one product image URL');
    }

    const parsedStock = stock !== undefined ? parseInt(stock, 10) : 0;
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      res.status(400);
      throw new Error('Stock must be a valid non-negative integer');
    }

    const product = await Product.create({
      name: name.trim().slice(0, 120),
      description: description.trim(),
      price: parsedPrice,
      discountPrice: parsedDiscount,
      category,
      brand: typeof brand === 'string' && brand.trim() ? brand.trim().slice(0, 60) : 'ABDULL Signature',
      images: images.filter((img) => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))),
      stock: parsedStock,
      sku: typeof sku === 'string' && sku.trim() ? sku.toUpperCase().trim().slice(0, 30) : undefined,
      specifications: Array.isArray(specifications) ? specifications : [],
      colors: Array.isArray(colors) ? colors : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      isFeatured: Boolean(isFeatured),
      createdBy: req.user._id,
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid product ID');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const {
      name,
      description,
      price,
      discountPrice,
      category,
      brand,
      images,
      stock,
      sku,
      specifications,
      colors,
      sizes,
      isFeatured,
      isActive,
    } = req.body;

    if (name && typeof name === 'string') product.name = name.trim().slice(0, 120);
    if (description && typeof description === 'string') product.description = description.trim();
    if (price !== undefined) {
      const p = parseFloat(price);
      if (Number.isFinite(p) && p >= 0) product.price = p;
    }
    if (discountPrice !== undefined) {
      const dp = parseFloat(discountPrice);
      if (Number.isFinite(dp) && dp >= 0) product.discountPrice = dp;
    }
    if (category && mongoose.Types.ObjectId.isValid(category)) product.category = category;
    if (brand && typeof brand === 'string') product.brand = brand.trim().slice(0, 60);
    if (Array.isArray(images) && images.length > 0) {
      product.images = images.filter((img) => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://')));
    }
    if (stock !== undefined) {
      const s = parseInt(stock, 10);
      if (Number.isInteger(s) && s >= 0) product.stock = s;
    }
    if (sku && typeof sku === 'string') product.sku = sku.toUpperCase().trim().slice(0, 30);
    if (Array.isArray(specifications)) product.specifications = specifications;
    if (Array.isArray(colors)) product.colors = colors;
    if (Array.isArray(sizes)) product.sizes = sizes;
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid product ID');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getFlashDeals,
  getTrendingProducts,
  getNewArrivals,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
