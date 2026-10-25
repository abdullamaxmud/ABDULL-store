import api from './api';

export const reviewService = {
  getProductReviews: async (productId) => {
    const response = await api.get(`/reviews/${productId}`);
    return response.data;
  },

  createReview: async (productId, reviewData) => {
    const response = await api.post(`/reviews/${productId}`, reviewData);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/item/${id}`);
    return response.data;
  },
};

export default reviewService;
