import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useT } from './LanguageContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const t = useT();

  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        let res = await wishlistService.getWishlist();

        // Merge items saved while signed out (toggle only the ones not already saved)
        const guestList = JSON.parse(localStorage.getItem('abdull_guest_wishlist') || '[]');
        if (guestList.length > 0 && res.success && res.data) {
          localStorage.removeItem('abdull_guest_wishlist');
          const savedIds = new Set(res.data.map((p) => p._id || p));
          for (const item of guestList) {
            const id = item._id || item;
            if (!savedIds.has(id)) {
              try {
                res = await wishlistService.toggleWishlist(id);
              } catch (mergeErr) {
                console.warn('Could not move guest wishlist item:', mergeErr.message);
              }
            }
          }
        }

        if (res.success && res.data) {
          setWishlist(res.data);
        }
      } catch (err) {
        console.warn('Could not load wishlist:', err.message);
      } finally {
        setLoading(false);
      }
    } else {
      const local = JSON.parse(localStorage.getItem('abdull_guest_wishlist') || '[]');
      setWishlist(local);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const toggleWishlist = async (product) => {
    const productId = product._id || product;
    const exists = isInWishlist(productId);

    try {
      if (isAuthenticated) {
        const res = await wishlistService.toggleWishlist(productId);
        if (res.success && res.data) {
          setWishlist(res.data);
          showToast(
            exists ? t('toast.removedFromWishlist') : t('toast.addedToWishlist', { name: product.name || t('toast.item') }),
            'info'
          );
        }
      } else {
        let updated;
        if (exists) {
          updated = wishlist.filter((item) => (item._id || item) !== productId);
          showToast(t('toast.removedFromWishlist'), 'info');
        } else {
          updated = [...wishlist, product];
          showToast(t('toast.addedToWishlist', { name: product.name || t('toast.item') }), 'success');
        }
        setWishlist(updated);
        localStorage.setItem('abdull_guest_wishlist', JSON.stringify(updated));
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
