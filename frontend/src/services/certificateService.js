import api from './api';

export const generateCertificate = (interviewId) => api.post('/certificates/generate', { interviewId });
export const getMyCertificates = () => api.get('/certificates/my-certificates');
export const getCertificate = (certId) => api.get(`/certificates/${certId}`);
