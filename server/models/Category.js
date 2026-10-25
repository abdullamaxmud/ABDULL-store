const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80',
    },
    icon: {
      type: String,
      default: 'grid',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Shown in the header menu strip and the All Categories menu
    showInMenu: {
      type: Boolean,
      default: true,
    },
    // Lower numbers appear first in menus and on the homepage
    sortOrder: {
      type: Number,
      default: 0,
    },
    // Optional admin-entered translations; empty fields fall back to the built-in ones, then English
    translations: {
      so: { name: { type: String, default: '', trim: true, maxlength: 60 }, description: { type: String, default: '', trim: true, maxlength: 250 } },
      ar: { name: { type: String, default: '', trim: true, maxlength: 60 }, description: { type: String, default: '', trim: true, maxlength: 250 } },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Slug auto-generation hook before validation
categorySchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});



const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
