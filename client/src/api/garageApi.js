import axiosClient from './axiosClient';

export const getGarageStatus = async (garageId) => {
  const response = await axiosClient.get(`/garage/status/${garageId}`);
  return response.data;
};

export const toggleOnlineStatus = async (garageId, isOnline) => {
  const response = await axiosClient.post('/garage/toggle-status', { garageId, isOnline });
  return response.data;
};

export const getIncomingRequests = async (garageId) => {
  const response = await axiosClient.get(`/garage/requests/${garageId}`);
  return response.data;
};

export const updateJobStatus = async (requestId, status, mechanicName) => {
  const payload = { requestId, status };
  if (mechanicName !== undefined) payload.mechanicName = mechanicName;
  const response = await axiosClient.post('/garage/update-job', payload);
  return response.data;
};

export const updateGarageLocation = async (locationData) => {
  const response = await axiosClient.post('/garage/update-location', locationData);
  return response.data;
};

export const getVerifiedGarages = async () => {
  const response = await axiosClient.get('/garage/verified');
  return response.data;
};

export const getGarageServices = async (garageId) => {
  const response = await axiosClient.get(`/garage/services/${garageId}`);
  return response.data;
};

export const addGarageService = async (serviceData) => {
  const response = await axiosClient.post('/garage/services', serviceData);
  return response.data;
};

export const toggleGarageService = async (serviceId, isActive) => {
  const response = await axiosClient.patch(`/garage/services/${serviceId}`, { isActive });
  return response.data;
};

export const getGarageEarnings = async (garageId) => {
  const response = await axiosClient.get(`/garage/earnings/${garageId}`);
  return response.data;
};
