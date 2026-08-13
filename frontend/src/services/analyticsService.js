import api from './api';

export const getCandidateAnalytics = () => api.get('/analytics/candidate');
export const getRecruiterAnalytics = () => api.get('/analytics/recruiter');
export const getAdminAnalytics = () => api.get('/analytics/admin');
export const getPlatformAnalytics = () => api.get('/analytics/platform');
