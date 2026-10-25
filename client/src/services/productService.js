import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getFeatured: async () => {
    const response = await api.get('/products/featured');
    return response.data;
  },

  getDeals: async () => {
    const response = await api.get('/products/deals');
    return response.data;
  },

  getTrending: async () => {
    const response = await api.get('/products/trending');
    return response.data;
  },

  getNewArrivals: async () => {
    const response = await api.get('/products/new-arrivals');
    return response.data;
  },

  getRelated: async (id) => {
    const response = await api.get(`/products/${id}/related`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
