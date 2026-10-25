import api from './api';

export const couponService = {
  validate: async (code, subtotal) => {
    const response = await api.post('/coupons/validate', { code, subtotal });
    return response.data;
  },

  getPublic: async () => {
    const response = await api.get('/coupons/public');
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },

  create: async (couponData) => {
    const response = await api.post('/coupons', couponData);
    return response.data;
  },

  update: async (id, couponData) => {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },
};

export default couponService;
