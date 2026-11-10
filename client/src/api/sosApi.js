import axiosClient from './axiosClient';

export const getPlatformPricing = async () => {
  const response = await axiosClient.get('/sos/pricing');
  return response.data;
};

export const reverseGeocodeLocation = async (lat, lng) => {
  const response = await axiosClient.get('/sos/reverse-geocode', { params: { lat, lng } });
  return response.data;
};

export const triggerEmergencySOS = async (sosData) => {
  const response = await axiosClient.post('/sos/request', sosData);
  return response.data;
};

export const getActiveSosForUser = async (userId) => {
  const response = await axiosClient.get(`/sos/active/${userId}`);
  return response.data;
};

export const getSosStatus = async (requestId) => {
  const response = await axiosClient.get(`/sos/status/${requestId}`);
  return response.data;
};

export const cancelSosRequest = async (requestId) => {
  const response = await axiosClient.post(`/sos/cancel/${requestId}`);
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await axiosClient.post('/sos/booking', bookingData);
  return response.data;
};

export const getUserBookings = async (userId) => {
  const response = await axiosClient.get(`/sos/bookings/${userId}`);
  return response.data;
};

export const getUserInvoices = async (userId) => {
  const response = await axiosClient.get(`/sos/invoices/${userId}`);
  return response.data;
};

export const payInvoice = async (invoiceId, paymentMethod) => {
  const response = await axiosClient.post(`/sos/invoices/${invoiceId}/pay`, { paymentMethod });
  return response.data;
};
