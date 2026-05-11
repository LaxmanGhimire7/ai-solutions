import api from './axios';

export const sendMessage = async (message) => {
  const response = await api.post('/chatbot/message', { message });
  return response.data;
};
