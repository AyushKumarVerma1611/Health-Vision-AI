import api from './api';

export const analyzeECG = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/ai/ecg', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

export const analyzeXray = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/ai/xray', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

export const analyzeMRI = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/ai/mri', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

export const predictHeart = async (data) => {
  const response = await api.post('/api/ai/heart', data, { timeout: 30000 });
  return response.data;
};

export const predictDiabetes = async (data) => {
  const response = await api.post('/api/ai/diabetes', data, { timeout: 30000 });
  return response.data;
};

export const getAnalyses = async (params = {}) => {
  const response = await api.get('/api/analyses', { params });
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get('/api/analyses/dashboard');
  return response.data;
};

export const deleteAnalysis = async (id) => {
  const response = await api.delete(`/api/analyses/${id}`);
  return response.data;
};
