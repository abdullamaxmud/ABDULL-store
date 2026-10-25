const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const isHttpUrl = (v) => typeof v === 'string' && /^https?:\/\//i.test(v.trim());
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

/** Copy the optional Somali/Arabic names from a request body onto a category. */
const applyTranslations = (category, translations) => {
  if (!translations || typeof translations !== 'object') return;
  for (const lang of ['so', 'ar']) {
    const t = translations[lang];
    if (!t || typeof t !== 'object') continue;
    if (t.name !== undefined) category.set(`translations.${lang}.name`, clip(t.name, 60));
    if (t.description !== undefined) category.set(`translations.${lang}.description`, clip(t.description, 250));
  }
};

const MENU_ORDER = { sortOrder: 1, name: 1 };

/**
 * @desc    Get active categories (storefront)
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort(MENU_ORDER);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get every category, including hidden ones, with product counts
 * @route   GET /api/categories/admin/all
 * @access  Private/Admin
 */
const getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const [categories, counts] = await Promise.all([
      Category.find({}).sort(MENU_ORDER),
      Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);
    const countById = new Map(counts.map((c) => [String(c._id), c.count]));

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories.map((c) => ({ ...c.toObject(), productCount: countById.get(String(c._id)) || 0 })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    if (!rawId || typeof rawId !== 'string') {
      res.status(400);
      throw new Error('Category identifier is required');
    }

    const query = mongoose.Types.ObjectId.isValid(rawId)
      ? { _id: rawId }
      : { slug: rawId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') };

    const category = await Category.findOne(query);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, icon, isActive, showInMenu, translations } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400);
      throw new Error('Please provide category name');
    }

    const trimmedName = name.trim().slice(0, 50);

    const categoryExists = await Category.findOne({ name: trimmedName });
    if (categoryExists) {
      res.status(400);
      throw new Error('Category with this name already exists');
    }

    // New categories go to the end of the menu
    const last = await Category.findOne({}).sort({ sortOrder: -1 }).select('sortOrder');

    const category = new Category({
      name: trimmedName,
      description: clip(description, 250),
      image: isHttpUrl(image) ? image.trim() : undefined,
      icon: typeof icon === 'string' ? icon.trim().slice(0, 30) : 'grid',
      isActive: isActive === undefined ? true : Boolean(isActive),
      showInMenu: showInMenu === undefined ? true : Boolean(showInMenu),
      sortOrder: (last?.sortOrder || 0) + 1,
      createdBy: req.user._id,
    });
    applyTranslations(category, translations);
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid category ID');
    }

    const { name, description, image, icon, isActive, showInMenu, sortOrder, translations } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    if (name && typeof name === 'string' && name.trim()) {
      const trimmedName = name.trim().slice(0, 50);
      const clash = await Category.findOne({ name: trimmedName, _id: { $ne: category._id } });
      if (clash) {
        res.status(400);
        throw new Error('Another category already uses this name');
      }
      category.name = trimmedName;
    }
    if (description !== undefined && typeof description === 'string') category.description = clip(description, 250);
    if (image !== undefined && isHttpUrl(image)) category.image = image.trim();
    if (icon !== undefined && typeof icon === 'string') category.icon = icon.trim().slice(0, 30);
    if (isActive !== undefined) category.isActive = Boolean(isActive);
    if (showInMenu !== undefined) category.showInMenu = Boolean(showInMenu);
    if (sortOrder !== undefined && Number.isFinite(Number(sortOrder))) category.sortOrder = Number(sortOrder);
    applyTranslations(category, translations);

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save a new menu order: body { ids: [categoryId, ...] } top to bottom
 * @route   PUT /api/categories/admin/reorder
 * @access  Private/Admin
 */
const reorderCategories = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 200 || !ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      res.status(400);
      throw new Error('Provide the category IDs in their new order');
    }

    await Category.bulkWrite(
      ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index + 1 } } } }))
    );

    const categories = await Category.find({}).sort(MENU_ORDER);
    res.status(200).json({ success: true, message: 'Category order saved', data: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category. If products still use it, they must be moved first:
 *          pass ?moveTo=<categoryId> to reassign them in the same step.
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid category ID');
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    const productCount = await Product.countDocuments({ category: category._id });
    let moved = 0;

    if (productCount > 0) {
      const { moveTo } = req.query;
      if (!moveTo || !mongoose.Types.ObjectId.isValid(moveTo) || moveTo === String(category._id)) {
        res.status(400);
        throw new Error(
          `"${category.name}" still has ${productCount} product(s). Choose another category to move them to before deleting.`
        );
      }
      const target = await Category.findById(moveTo);
      if (!target) {
        res.status(404);
        throw new Error('The category to move products into was not found');
      }
      const result = await Product.updateMany({ category: category._id }, { $set: { category: target._id } });
      moved = result.modifiedCount;
    }

    await Category.findByIdAndDelete(category._id);

    res.status(200).json({
      success: true,
      message: moved ? `Category deleted and ${moved} product(s) moved` : 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getAllCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
};
