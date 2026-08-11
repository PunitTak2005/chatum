import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, serverUrl } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const socketRef = useRef(null);
  const currentRoomRef = useRef(currentRoom);
  currentRoomRef.current = currentRoom;

  useEffect(() => {
    if (!user) return;

    const s = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      s.emit('user_login', { username: user.username, avatar: user.avatar });
      s.emit('join_room', { room: currentRoomRef.current });
      loadRoomHistory(currentRoomRef.current);
    });

    s.on('disconnect', () => setIsConnected(false));

    s.on('receive_message', (msg) => {
      if (msg.room === currentRoomRef.current) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    s.on('user_typing_start', ({ room, username }) => {
      if (room === currentRoomRef.current && username !== user.username) {
        setTypingUsers((prev) => [...new Set([...prev, username])]);
      }
    });

    s.on('user_typing_stop', ({ room, username }) => {
      if (room === currentRoomRef.current) {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
      }
    });

    s.on('presence_update', ({ onlineUsers: onList }) => {
      if (onList) setOnlineUsers(onList);
    });

    fetchRooms();

    return () => {
      s.disconnect();
    };
  }, [user, serverUrl]);

  const fetchRooms = async () => {
    try {
      const list = await api.getRooms(serverUrl);
      setRooms(list);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const loadRoomHistory = async (roomId) => {
    try {
      const history = await api.getMessages(roomId, 50, 0, serverUrl);
      setMessages(history || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const switchRoom = (roomId) => {
    setCurrentRoom(roomId);
    setTypingUsers([]);
    if (socketRef.current) {
      socketRef.current.emit('join_room', { room: roomId });
    }
    loadRoomHistory(roomId);
  };

  const sendMessage = (content) => {
    if (!content.trim() || !socketRef.current || !user) return;
    socketRef.current.emit('send_message', {
      room: currentRoom,
      sender: user.username,
      senderAvatar: user.avatar,
      content: content.trim()
    });
  };

  const sendTyping = (isTyping) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit(isTyping ? 'typing_start' : 'typing_stop', {
      room: currentRoom,
      username: user.username
    });
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        rooms,
        currentRoom,
        messages,
        onlineUsers,
        typingUsers,
        switchRoom,
        sendMessage,
        sendTyping
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
