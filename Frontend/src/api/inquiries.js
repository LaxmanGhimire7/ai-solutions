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

export const deleteInquiry = async (id) => {
  const response = await api.delete(`/inquiries/${id}`);
  return response.data;
};

const getFilenameFromDisposition = (value = '') => {
  const match = value.match(/filename="?([^"]+)"?/i);
  return match?.[1] || `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
};

export const exportCSV = async () => {
  const response = await api.get('/inquiries/export-csv', {
    headers: {
      Accept: 'text/csv',
    },
    responseType: 'blob',
  });

  const contentType = String(response.headers['content-type'] || response.data.type || '');

  if (/json|xml|html/i.test(contentType)) {
    const text = await response.data.text();
    let message = 'CSV export failed. The server returned a non-CSV response.';

    try {
      const payload = JSON.parse(text);
      message = payload.message || message;
    } catch {
      if (text.trim().startsWith('<')) {
        message = 'CSV export failed. The server returned an HTML/XML response instead of CSV.';
      }
    }

    throw new Error(message);
  }

  return {
    blob: new Blob([response.data], { type: 'text/csv;charset=utf-8' }),
    filename: getFilenameFromDisposition(response.headers['content-disposition']),
  };
};
