import api from './api';

export const getAdminAnalytics = () => api.get('/analytics/admin');
export const getAdminUsers = () => api.get('/admin/users');
export const getAdminInterviews = () => api.get('/admin/interviews');
export const deactivateUser = (id) => api.delete(`/admin/users/${id}`);
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
