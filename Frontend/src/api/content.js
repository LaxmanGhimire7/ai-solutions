import api from './axios';

export const contentLabels = {
  services: 'Services',
  projects: 'Projects',
  testimonials: 'Testimonials',
  articles: 'Articles / Blogs',
  events: 'Events',
  gallery: 'Gallery',
};

export const getAdminContent = async (type, params = {}) => {
  const response = await api.get(`/content/${type}/admin/all`, { params });
  return response.data;
};

export const createContent = async (type, data) => {
  const response = await api.post(`/content/${type}`, data);
  return response.data;
};

export const updateContent = async (type, id, data) => {
  const response = await api.put(`/content/${type}/${id}`, data);
  return response.data;
};

export const deleteContent = async (type, id) => {
  const response = await api.delete(`/content/${type}/${id}`);
  return response.data;
};
