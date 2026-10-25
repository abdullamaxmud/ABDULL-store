const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug price discountPrice images stock brand isActive',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart or increment quantity
 * @route   POST /api/cart/items
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, color = '', size = '' } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error('Valid product ID is required');
    }

    const rawQty = parseInt(quantity, 10);
    if (!Number.isInteger(rawQty) || rawQty <= 0 || rawQty > 50) {
      res.status(400);
      throw new Error('Quantity must be an integer between 1 and 50');
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error('Product not found or unavailable');
    }

    if (product.stock < rawQty) {
      res.status(400);
      throw new Error(`Only ${product.stock} units currently available in stock`);
    }

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    const cleanColor = typeof color === 'string' ? color.trim().slice(0, 50) : '';
    const cleanSize = typeof size === 'string' ? size.trim().slice(0, 50) : '';

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity: rawQty, color: cleanColor, size: cleanSize, price }],
      });
    } else {
      // Find existing item with matching product, color, and size
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.color === cleanColor &&
          item.size === cleanSize
      );

      if (itemIndex > -1) {
        const newQty = cart.items[itemIndex].quantity + rawQty;
        if (newQty > product.stock) {
          res.status(400);
          throw new Error(`Cannot add more. Inventory limit is ${product.stock}`);
        }
        if (newQty > 50) {
          res.status(400);
          throw new Error('Maximum quantity limit per item is 50');
        }
        cart.items[itemIndex].quantity = newQty;
        cart.items[itemIndex].price = price;
      } else {
        cart.items.push({ product: productId, quantity: rawQty, color: cleanColor, size: cleanSize, price });
      }

      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice images stock brand',
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/items/:itemId
 * @access  Private
 */
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      res.status(400);
      throw new Error('Valid cart item ID is required');
    }

    const rawQty = parseInt(quantity, 10);
    if (!Number.isInteger(rawQty) || rawQty < 1 || rawQty > 50) {
      res.status(400);
      throw new Error('Quantity must be an integer between 1 and 50');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      res.status(404);
      throw new Error('Item not found in cart');
    }

    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error('Associated product not found or unavailable');
    }

    if (rawQty > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} units currently available in stock`);
    }

    item.quantity = rawQty;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice images stock brand',
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      res.status(400);
      throw new Error('Valid cart item ID is required');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice images stock brand',
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: { items: [] },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
};
