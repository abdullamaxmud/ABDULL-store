import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // params: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' } (defaults to the last 30 days)
  getAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },

  /** Download orders in a date range as a CSV file. */
  exportOrdersCsv: async (params = {}) => {
    const response = await api.get('/admin/orders/export', { params, responseType: 'blob', timeout: 60000 });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `abdull-orders-${params.from || 'start'}-to-${params.to || 'today'}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  unlockUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/unlock`);
    return response.data;
  },

  getAllOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  updateOrderStatus: async (id, statusData) => {
    const response = await api.put(`/admin/orders/${id}/status`, statusData);
    return response.data;
  },

  getInventory: async () => {
    const response = await api.get('/admin/inventory');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await api.put(`/admin/users/${id}/status`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },
};

export default adminService;
