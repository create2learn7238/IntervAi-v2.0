import api from './api';

export const getAdminAnalytics = () => api.get('/analytics/admin');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const getAdminInterviews = () => api.get('/admin/interviews');
export const deactivateUser = (id) => api.delete(`/admin/users/${id}`);
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const toggleUserSuspension = (id, isSuspended) => api.put(`/admin/users/${id}/suspend`, { isSuspended });
export const getAdminFeedbacks = () => api.get('/admin/feedbacks');
