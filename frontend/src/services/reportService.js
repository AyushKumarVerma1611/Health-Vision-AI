import api from './api';

export const uploadReport = async (file, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description || '');
  const response = await api.post('/api/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getReports = async () => {
  const response = await api.get('/api/reports');
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await api.delete(`/api/reports/${id}`);
  return response.data;
};

export const generateBrief = async () => {
  const response = await api.post('/api/brief/generate', {}, { timeout: 60000 });
  return response.data;
};

export const getBriefs = async () => {
  const response = await api.get('/api/brief');
  return response.data;
};

export const getDataSummary = async () => {
  const response = await api.get('/api/brief/data-summary');
  return response.data;
};

export const downloadPDF = async (analysisData) => {
  const response = await api.post('/api/ai/report', analysisData, { timeout: 30000 });
  return response.data;
};

export const analyzeDocument = async (data) => {
  const formData = new FormData();
  if (data.reportId) {
    formData.append('reportId', data.reportId);
  } else if (data.file) {
    formData.append('file', data.file);
  }
  const response = await api.post('/api/ai/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return response.data;
};
