import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getSocket } from '../services/socket.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [socketError, setSocketError] = useState(null);

  const socketRef = useRef(null);
  const currentRoomRef = useRef(currentRoom);
  const userRef = useRef(user);
  const typingMapRef = useRef(new Map()); // username -> timeoutId

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 1. Fetch available rooms on mount
  const refreshRooms = useCallback(async () => {
    try {
      const roomList = await api.getRooms();
      setRooms(roomList);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  }, []);

  // Fetch all registered users with presence
  const refreshUsers = useCallback(async () => {
    try {
      const userList = await api.getAllUsers();
      setAllUsers(userList || []);
      setOnlineUsers(userList.filter((u) => u.status === 'online'));
    } catch (err) {
      console.error('Failed to load users presence:', err);
    }
  }, []);

  useEffect(() => {
    refreshRooms();
    refreshUsers();
  }, [refreshRooms, refreshUsers]);

  // 2. Fetch message history whenever currentRoom changes
  const loadRoomMessages = useCallback(async (roomId) => {
    setIsLoadingMessages(true);
    try {
      const history = await api.getMessages(roomId, 100, 0);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load messages for room:', roomId, err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (currentRoom) {
      loadRoomMessages(currentRoom);
      // Clear typing users on room change
      typingMapRef.current.forEach((timeout) => clearTimeout(timeout));
      typingMapRef.current.clear();
      setTypingUsers([]);
    }
  }, [currentRoom, loadRoomMessages]);

  // Helper to sync typingUsers state from ref map
  const syncTypingState = () => {
    setTypingUsers(Array.from(typingMapRef.current.keys()));
  };

  // 3. Setup Socket Connection & Listeners
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log('⚡ Socket connected:', socket.id);
      setIsConnected(true);
      setSocketError(null);

      // Authenticate socket session with current user info
      socket.emit('user_login', user, (res) => {
        if (res?.success) {
          socket.emit('join_room', { room: currentRoomRef.current });
        }
      });
    };

    const onDisconnect = (reason) => {
      console.log('⚡ Socket disconnected:', reason);
      setIsConnected(false);
    };

    const onConnectError = (err) => {
      console.error('⚡ Socket connection error:', err.message);
      setSocketError('Connecting to live server...');
    };

    const onReceiveMessage = (newMsg) => {
      if (newMsg.room === currentRoomRef.current) {
        if (typingMapRef.current.has(newMsg.sender)) {
          clearTimeout(typingMapRef.current.get(newMsg.sender));
          typingMapRef.current.delete(newMsg.sender);
          syncTypingState();
        }

        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        if (userRef.current && newMsg.sender !== userRef.current.username) {
          socket.emit('message_read', {
            messageId: newMsg.id,
            room: currentRoomRef.current,
            readBy: userRef.current.username
          });
        }
      }
    };

    const onMessageStatusUpdated = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
      );
    };

    // Unified presence event
    const onPresenceUpdate = (presenceData) => {
      if (presenceData?.users) {
        setAllUsers(presenceData.users);
        setOnlineUsers(presenceData.users.filter((u) => u.status === 'online'));
      }
    };

    const onOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    const onUserTypingStart = ({ room, username }) => {
      const activeRoom = currentRoomRef.current;
      const currentUser = userRef.current;

      if (room === activeRoom && currentUser && username !== currentUser.username) {
        if (typingMapRef.current.has(username)) {
          clearTimeout(typingMapRef.current.get(username));
        }

        const timeout = setTimeout(() => {
          typingMapRef.current.delete(username);
          syncTypingState();
        }, 6000);

        typingMapRef.current.set(username, timeout);
        syncTypingState();
      }
    };

    const onUserTypingStop = ({ room, username }) => {
      if (room === currentRoomRef.current) {
        if (typingMapRef.current.has(username)) {
          clearTimeout(typingMapRef.current.get(username));
          typingMapRef.current.delete(username);
          syncTypingState();
        }
      }
    };

    const onMessagesCleared = ({ room }) => {
      if (room === 'all' || room === currentRoomRef.current) {
        setMessages([]);
      }
    };

    const onForceLogout = ({ username }) => {
      if (userRef.current && (!username || userRef.current.username.toLowerCase() === username.toLowerCase())) {
        localStorage.removeItem('chatum_user');
        localStorage.removeItem('chatum_token');
        localStorage.removeItem('pulsechat_user');
        localStorage.removeItem('pulsechat_token');
        window.location.reload();
      }
    };

    const onProfileUpdated = ({ oldUsername, user: updatedUser }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.sender.toLowerCase() === oldUsername.toLowerCase()) {
            return {
              ...msg,
              sender: updatedUser.username,
              senderAvatar: updatedUser.avatar
            };
          }
          return msg;
        })
      );
      refreshUsers();
    };

    // Bind listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('receive_message', onReceiveMessage);
    socket.on('message_status_updated', onMessageStatusUpdated);
    socket.on('messages_cleared', onMessagesCleared);
    socket.on('profile_updated', onProfileUpdated);
    socket.on('force_logout', onForceLogout);
    socket.on('presence_update', onPresenceUpdate);
    socket.on('online_users', onOnlineUsers);
    socket.on('user_typing_start', onUserTypingStart);
    socket.on('user_typing_stop', onUserTypingStop);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('receive_message', onReceiveMessage);
      socket.off('message_status_updated', onMessageStatusUpdated);
      socket.off('messages_cleared', onMessagesCleared);
      socket.off('profile_updated', onProfileUpdated);
      socket.off('force_logout', onForceLogout);
      socket.off('presence_update', onPresenceUpdate);
      socket.off('online_users', onOnlineUsers);
      socket.off('user_typing_start', onUserTypingStart);
      socket.off('user_typing_stop', onUserTypingStop);
    };
  }, [user]);

  // Switch Chat Room
  const switchRoom = (roomId) => {
    if (roomId === currentRoom) return;
    setCurrentRoom(roomId);
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_room', { room: roomId });
    }
  };

  // Send Message via Socket
  const sendMessage = async (content) => {
    if (!content.trim() || !user) return;

    const messagePayload = {
      room: currentRoom,
      sender: user.username,
      senderAvatar: user.avatar,
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', messagePayload);
    } else {
      try {
        const saved = await api.sendMessage(messagePayload);
        setMessages((prev) => [...prev, saved]);
      } catch (err) {
        console.error('Error sending message via REST fallback:', err);
      }
    }
  };

  // Typing triggers
  const startTyping = () => {
    if (socketRef.current && isConnected && user) {
      socketRef.current.emit('typing_start', {
        room: currentRoomRef.current,
        username: user.username
      });
    }
  };

  const stopTyping = () => {
    if (socketRef.current && isConnected && user) {
      socketRef.current.emit('typing_stop', {
        room: currentRoomRef.current,
        username: user.username
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        socketError,
        currentRoom,
        rooms,
        messages,
        allUsers,
        onlineUsers,
        offlineUsers: allUsers.filter((u) => u.status !== 'online'),
        typingUsers,
        isLoadingMessages,
        switchRoom,
        sendMessage,
        startTyping,
        stopTyping,
        refreshRooms,
        refreshUsers
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
