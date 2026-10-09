import axiosClient from './axiosClient';

export const toggleOnlineStatus = async (garageId, isOnline) => {
  const response = await axiosClient.post('/garage/toggle-status', { garageId, isOnline });
  return response.data;
};

export const getIncomingRequests = async (garageId) => {
  const response = await axiosClient.get(`/garage/requests/${garageId}`);
  return response.data;
};

export const updateJobStatus = async (requestId, status) => {
  const response = await axiosClient.post('/garage/update-job', { requestId, status });
  return response.data;
};
