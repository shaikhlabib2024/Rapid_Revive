import axiosClient from './axiosClient';

export const triggerEmergencySOS = async (sosData) => {
  const response = await axiosClient.post('/sos/request', sosData);
  return response.data;
};

export const getSosStatus = async (requestId) => {
  const response = await axiosClient.get(`/sos/status/${requestId}`);
  return response.data;
};
