import api, { warmBackend } from './axios';

export const sendMessage = async (message) => {
  await warmBackend();
  const response = await api.post('/chatbot/message', { message });
  return response.data;
};
