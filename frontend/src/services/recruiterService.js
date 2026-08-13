import api from './api';

export const getRecruiterDashboard = () => api.get('/recruiter/dashboard');
export const getRecruiterCandidates = (page = 1, filters = {}) => {
  let query = `/recruiter/candidates?page=${page}&limit=50`;
  if (filters.skill) query += `&skill=${encodeURIComponent(filters.skill)}`;
  if (filters.targetRole) query += `&targetRole=${encodeURIComponent(filters.targetRole)}`;
  if (filters.minScore) query += `&minScore=${filters.minScore}`;
  if (filters.search) query += `&search=${encodeURIComponent(filters.search)}`;
  return api.get(query);
};
export const getCandidateDetails = (id) => api.get(`/recruiter/candidates/${id}`);
export const getRecruiterReports = (mockid) => api.get(`/recruiter/reports?mockid=${mockid}`);
export const getRecruiterAnalytics = () => api.get('/recruiter/analytics');
