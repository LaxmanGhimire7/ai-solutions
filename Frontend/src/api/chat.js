import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: false,
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const joinAdmin = () => {
  initSocket().emit('join_admin');
};

export const sendAdminReply = ({ sessionId, targetSocketId, content }) => {
  initSocket().emit('admin_reply', { sessionId, targetSocketId, content });
};

export const onCustomerMessage = (handler) => {
  initSocket().on('customer_message', handler);
};

export const onNewChatSession = (handler) => {
  initSocket().on('new_chat_session', handler);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
