import api from './axios';

export const submitInquiry = async (data) => {
  const response = await api.post('/inquiries', data);
  return response.data;
};

export const getInquiries = async (params = {}) => {
  const response = await api.get('/inquiries', { params });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getWeeklyInquiries = async () => {
  const response = await api.get('/dashboard/weekly-inquiries');
  return response.data;
};

export const updateInquiryStatus = async (id, status) => {
  const response = await api.patch(`/inquiries/${id}/status`, { status });
  return response.data;
};

export const exportCSV = async () => {
  const response = await api.get('/dashboard/export-csv', {
    responseType: 'blob',
  });
  return response.data;
};
