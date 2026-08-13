import api from './api';

export const getFeedback = (mockid) => api.get(`/feedback/${mockid}`);
export const saveAnswer  = (mockid, data) => api.post(`/feedback/${mockid}`, data);
export const submitSiteFeedback = (data) => api.post('/site-feedback', data);
