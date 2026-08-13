import api from './api';

export const getInterviews  = (email)  => api.get(`/interviews?email=${email}`);
export const getInterview   = (mockid) => api.get(`/interviews/${mockid}`);
export const createInterview = (data)  => api.post('/interviews', data);
export const sendEmailReport = (data)  => api.post('/interviews/send-email-report', data);
export const uploadSessionVideo = (mockid, formData) => api.post(`/interviews/${mockid}/video`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
