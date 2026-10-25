import api from './api';

export const paymentService = {
  getConfig: async () => {
    const response = await api.get('/payments/config');
    return response.data;
  },

  verify: async (orderId) => {
    const response = await api.get(`/payments/verify/${orderId}`);
    return response.data;
  },

  retry: async (orderId) => {
    const response = await api.post(`/payments/retry/${orderId}`);
    return response.data;
  },
};

export default paymentService;
