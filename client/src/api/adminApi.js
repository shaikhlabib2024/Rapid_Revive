import axiosClient from './axiosClient';

export const getPendingVerifications = async () => {
  const response = await axiosClient.get('/admin/verifications');
  return response.data;
};

export const verifyGarage = async (garageId, approve) => {
  const response = await axiosClient.post('/admin/verify-garage', { garageId, approve });
  return response.data;
};

export const getSystemStats = async () => {
  const response = await axiosClient.get('/admin/stats');
  return response.data;
};

export const getLiveDispatches = async () => {
  const response = await axiosClient.get('/admin/dispatches');
  return response.data;
};

export const getAdminDirectory = async () => {
  const response = await axiosClient.get('/admin/directory');
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await axiosClient.post('/admin/user-status', { userId, status });
  return response.data;
};

export const getAdminSettings = async () => {
  const response = await axiosClient.get('/admin/settings');
  return response.data;
};

export const updateAdminSettings = async (settings) => {
  const response = await axiosClient.post('/admin/settings', settings);
  return response.data;
};
