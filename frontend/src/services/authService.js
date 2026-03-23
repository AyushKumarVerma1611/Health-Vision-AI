import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/api/auth/profile', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put('/api/auth/password', data);
  return response.data;
};

export const deleteAccount = async (password) => {
  const response = await api.delete('/api/auth/account', { data: { password } });
  return response.data;
};
