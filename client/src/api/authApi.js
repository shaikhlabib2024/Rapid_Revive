import axiosClient from './axiosClient';

export const loginUser = async (credentials) => {
  const response = await axiosClient.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axiosClient.post('/auth/register', userData);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await axiosClient.post('/auth/profile', profileData);
  return response.data;
};

export const changeUserPassword = async (passwordData) => {
  const response = await axiosClient.post('/auth/change-password', passwordData);
  return response.data;
};
