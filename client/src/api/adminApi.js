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
