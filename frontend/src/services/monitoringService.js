import api from './api';

export const initMonitorSession = (interviewId, userEmail) => api.post('/monitor/init', { interviewId, userEmail });
export const logMonitorViolation = (data) => api.post('/monitor/violation', data);
export const getMonitorSummary = (interviewId) => api.get(`/monitor/summary/${interviewId}`);
