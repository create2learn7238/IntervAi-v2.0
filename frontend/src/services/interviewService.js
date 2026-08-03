import api from './api';

export const getInterviews  = (email)  => api.get(`/interviews?email=${email}`);
export const getInterview   = (mockid) => api.get(`/interviews/${mockid}`);
export const createInterview = (data)  => api.post('/interviews', data);
