import api from './api';

export const supportService = {
  subscribe: async (email) => {
    const response = await api.post('/support/newsletter', { email });
    return response.data;
  },

  sendContactMessage: async (messageData) => {
    const response = await api.post('/support/contact', messageData);
    return response.data;
  },

  getMessages: async (params = {}) => {
    const response = await api.get('/support/messages', { params });
    return response.data;
  },

  updateMessageStatus: async (id, status) => {
    const response = await api.put(`/support/messages/${id}`, { status });
    return response.data;
  },
};

export default supportService;
