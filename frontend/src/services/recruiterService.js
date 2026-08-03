import api from './api';

export const getRecruiterDashboard = () => api.get('/recruiter/dashboard');
export const getRecruiterCandidates = (page = 1) => api.get(`/recruiter/candidates?page=${page}&limit=50`);
export const getCandidateDetails = (id) => api.get(`/recruiter/candidate/${id}`);
export const getRecruiterInterviews = (page = 1) => api.get(`/recruiter/interviews?page=${page}&limit=50`);
export const scheduleInterview = (data) => api.post('/recruiter/schedule', data);
export const cancelInterview = (id) => api.put(`/recruiter/interviews/${id}/cancel`);
export const getRecruiterReports = (mockid) => api.get(`/recruiter/reports?mockid=${mockid}`);
export const getRecruiterAnalytics = () => api.get('/recruiter/analytics');

export const getNotifications = (page = 1) => api.get(`/recruiter/notifications?page=${page}&limit=20`);
export const markNotificationRead = (id) => api.put(`/recruiter/notifications/${id}/read`);
