import { io } from 'socket.io-client';
import api, { warmBackend } from './axios';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let socket;
let activeToken = null;

const getSocket = (token = null) => {
  if (!socket) {
    activeToken = token;
    socket = io(socketUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: token ? { token } : {},
    });
  } else if (activeToken !== token) {
    activeToken = token;
    socket.auth = token ? { token } : {};
    if (socket.connected) socket.disconnect();
  }

  if (!socket.connected) socket.connect();
  return socket;
};

const emitWithAck = async (event, payload, token = activeToken) => {
  await warmBackend();

  return new Promise((resolve, reject) => {
    const client = getSocket(token);
    const timeout = window.setTimeout(
      () => reject(new Error('Support server did not respond. Please try again.')),
      30000
    );

    client.emit(event, payload, (response) => {
      window.clearTimeout(timeout);
      if (!response?.success) {
        reject(new Error(response?.message || 'Unable to complete chat action'));
        return;
      }
      resolve(response);
    });
  });
};

export const connectCustomer = () => getSocket(null);

export const connectAdmin = (token) => getSocket(token);

export const joinAdmin = async (token) => {
  await warmBackend();

  return new Promise((resolve, reject) => {
    const client = getSocket(token);
    const timeout = window.setTimeout(
      () => reject(new Error('Unable to join support inbox. Please try again.')),
      30000
    );

    client.emit('join_admin', (response) => {
      window.clearTimeout(timeout);
      if (!response?.success) {
        reject(new Error(response?.message || 'Admin authentication required'));
        return;
      }
      resolve(response);
    });
  });
};

export const startCustomerChat = (data) => emitWithAck('start_chat', data, null);

export const sendCustomerMessage = ({ sessionId, content }) =>
  emitWithAck('customer_message', { sessionId, content }, null);

export const submitChatRating = ({ sessionId, rating, ratingComment }) =>
  emitWithAck('submit_chat_rating', { sessionId, rating, ratingComment }, null);

export const sendAdminReply = ({ sessionId, content }, token) =>
  emitWithAck('admin_reply', { sessionId, content }, token);

export const markChatRead = (sessionId, token) => {
  getSocket(token).emit('mark_chat_read', { sessionId });
};

export const onChatEvent = (event, handler, token = activeToken) => {
  const client = getSocket(token);
  client.on(event, handler);
  return () => client.off(event, handler);
};

export const getChatSessions = async (params = {}) => {
  const response = await api.get('/chat/sessions', { params });
  return response.data;
};

export const getChatSession = async (id) => {
  const response = await api.get(`/chat/sessions/${id}`);
  return response.data;
};

export const updateChatStatus = async (id, status) => {
  const response = await api.patch(`/chat/sessions/${id}/status`, { status });
  return response.data;
};

export const deleteChatSession = async (id) => {
  const response = await api.delete(`/chat/sessions/${id}`);
  return response.data;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = undefined;
    activeToken = null;
  }
};
