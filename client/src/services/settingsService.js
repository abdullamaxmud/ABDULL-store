import api from './api';

export const settingsService = {
  getPublic: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  getAdmin: async () => {
    const response = await api.get('/settings/admin');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  },
};

export default settingsService;
