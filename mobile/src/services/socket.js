import { io } from 'socket.io-client';
import { BACKEND_URL } from './api';

let socket = null;

export const getSocket = (backendUrl = BACKEND_URL) => {
  if (!socket) {
    socket = io(backendUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};
