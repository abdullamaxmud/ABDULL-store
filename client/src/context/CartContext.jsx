import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useT } from './LanguageContext';
import { useSettings } from './SettingsContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const t = useT();
  const { settings } = useSettings();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const fetchCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);

        // Carry over anything the shopper added while signed out
        const guestCart = JSON.parse(localStorage.getItem('abdull_guest_cart') || '{"items":[]}');
        if (guestCart.items && guestCart.items.length > 0) {
          localStorage.removeItem('abdull_guest_cart');
          for (const item of guestCart.items) {
            try {
              await cartService.addToCart({
                productId: item.product?._id || item.product,
                quantity: item.quantity,
                color: item.color || '',
                size: item.size || '',
              });
            } catch (mergeErr) {
              console.warn('Could not move guest cart item:', mergeErr.message);
            }
          }
          showToast(t('toast.guestBagMerged'), 'info');
        }

        const res = await cartService.getCart();
        if (res.success && res.data) {
          setCart(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch cart:', err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Load local guest cart
      const guestCart = JSON.parse(localStorage.getItem('abdull_guest_cart') || '{"items":[]}');
      setCart(guestCart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1, color = '', size = '', options = { openDrawer: true }) => {
    try {
      if (isAuthenticated) {
        const res = await cartService.addToCart({
          productId: product._id,
          quantity,
          color,
          size,
        });
        if (res.success && res.data) {
          setCart(res.data);
          showToast(t('toast.addedToBag', { name: product.name }), 'success');
          if (options.openDrawer !== false) {
            setIsCartOpen(true);
          }
        }
      } else {
        // Guest cart in localStorage
        const price = product.discountPrice > 0 ? product.discountPrice : product.price;
        const currentItems = [...cart.items];
        const existingIdx = currentItems.findIndex(
          (i) =>
            (i.product._id === product._id || i.product === product._id) &&
            i.color === color &&
            i.size === size
        );

        if (existingIdx > -1) {
          currentItems[existingIdx].quantity += quantity;
        } else {
          currentItems.push({
            _id: Date.now().toString(),
            product: {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              discountPrice: product.discountPrice,
              images: product.images,
              stock: product.stock,
              brand: product.brand,
            },
            quantity,
            color,
            size,
            price,
          });
        }

        const newCart = { items: currentItems };
        setCart(newCart);
        localStorage.setItem('abdull_guest_cart', JSON.stringify(newCart));
        showToast(t('toast.addedToBag', { name: product.name }), 'success');
        if (options.openDrawer !== false) {
          setIsCartOpen(true);
        }
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (quantity < 1) return;
      if (isAuthenticated) {
        const res = await cartService.updateQuantity(itemId, quantity);
        if (res.success && res.data) {
          setCart(res.data);
        }
      } else {
        const updated = cart.items.map((item) =>
          item._id === itemId ? { ...item, quantity } : item
        );
        const newCart = { items: updated };
        setCart(newCart);
        localStorage.setItem('abdull_guest_cart', JSON.stringify(newCart));
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (isAuthenticated) {
        const res = await cartService.removeFromCart(itemId);
        if (res.success && res.data) {
          setCart(res.data);
          showToast(t('toast.removedFromBag'), 'info');
        }
      } else {
        const updated = cart.items.filter((item) => item._id !== itemId);
        const newCart = { items: updated };
        setCart(newCart);
        localStorage.setItem('abdull_guest_cart', JSON.stringify(newCart));
        showToast(t('toast.removedFromBag'), 'info');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await cartService.clearCart();
      }
      setCart({ items: [] });
      localStorage.removeItem('abdull_guest_cart');
    } catch (error) {
      console.warn('Error clearing cart:', error.message);
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cart.items.reduce((sum, item) => {
    const itemPrice = item.price || item.product?.discountPrice || item.product?.price || 0;
    return sum + itemPrice * item.quantity;
  }, 0);

  const freeShippingThreshold = settings.freeShippingThreshold;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = freeShippingThreshold > 0 ? Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100)) : 100;
  const shippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : settings.flatShippingFee;
  const cartTotal = cartSubtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal: Math.round(cartSubtotal * 100) / 100,
        shippingFee,
        cartTotal: Math.round(cartTotal * 100) / 100,
        freeShippingThreshold,
        freeShippingRemaining: Math.round(freeShippingRemaining * 100) / 100,
        freeShippingProgress,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
