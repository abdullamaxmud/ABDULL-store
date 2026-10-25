import api from './api';

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // moveTo: category ID that receives this category's products before deletion
  deleteCategory: async (id, moveTo) => {
    const response = await api.delete(`/categories/${id}`, { params: moveTo ? { moveTo } : {} });
    return response.data;
  },

  // Admin: every category including hidden ones, with product counts
  getAllAdmin: async () => {
    const response = await api.get('/categories/admin/all');
    return response.data;
  },

  reorder: async (ids) => {
    const response = await api.put('/categories/admin/reorder', { ids });
    return response.data;
  },
};

export default categoryService;
