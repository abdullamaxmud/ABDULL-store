import api from './api';

export const wishlistService = {
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  toggleWishlist: async (productId) => {
    const response = await api.post('/wishlist/toggle', { productId });
    return response.data;
  },
};

export default wishlistService;
