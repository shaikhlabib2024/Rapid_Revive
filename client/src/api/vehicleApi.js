import axiosClient from './axiosClient';

export const getUserVehicles = async (userId) => {
  const response = await axiosClient.get(`/vehicles/user/${userId}`);
  return response.data;
};

export const addVehicle = async (vehicleData) => {
  const response = await axiosClient.post('/vehicles', vehicleData);
  return response.data;
};

export const deleteVehicle = async (vehicleId) => {
  const response = await axiosClient.delete(`/vehicles/${vehicleId}`);
  return response.data;
};
