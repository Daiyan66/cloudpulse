import apiClient from './apiClient';

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  updatePassword: (data) => apiClient.patch('/auth/password', data),
};

export const monitorService = {
  getAll: () => apiClient.get('/monitors'),
  getById: (id) => apiClient.get(`/monitors/${id}`),
  create: (data) => apiClient.post('/monitors', data),
  update: (id, data) => apiClient.put(`/monitors/${id}`, data),
  remove: (id) => apiClient.delete(`/monitors/${id}`),
  getPingHistory: (id, params) => apiClient.get(`/monitors/${id}/history`, { params }),
};
