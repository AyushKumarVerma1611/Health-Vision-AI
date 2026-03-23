import api from './api';

export const sendMessage = async (message, sessionId, history) => {
  const response = await api.post('/api/ai/chat', { message, sessionId, history }, { timeout: 30000 });
  return response.data;
};

export const getSessions = async () => {
  const response = await api.get('/api/chats');
  return response.data;
};

export const getSession = async (sessionId) => {
  const response = await api.get(`/api/chats/${sessionId}`);
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await api.delete(`/api/chats/${sessionId}`);
  return response.data;
};

export const saveSession = async (sessionData) => {
  const response = await api.post('/api/chats', sessionData);
  return response.data;
};
