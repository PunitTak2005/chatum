import { MessageModel } from '../models/messageModel.js';
import { UserModel } from '../models/userModel.js';

// In-memory store of active connected clients: socketId -> user profile
const activeUsers = new Map();

export const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Register / Authenticate user session
    socket.on('user_login', async (userData, callback) => {
      try {
        const username = userData?.username?.trim();
        const avatar = userData?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username || socket.id}`;
        
        if (!username) {
          if (callback) callback({ success: false, error: 'Username is required' });
          return;
        }

        const bannedDemoUsers = ['alex_frontend', 'elena_design', 'sarah_product', 'dave_backend'];
        if (bannedDemoUsers.includes(username.toLowerCase())) {
          socket.emit('force_logout', { username });
          if (callback) callback({ success: false, error: 'User is discontinued' });
          return;
        }

        // Update user status in SQLite database
        const dbUser = await UserModel.createOrUpdate({
          username,
          avatar,
          status: 'online'
        });

        activeUsers.set(socket.id, {
          socketId: socket.id,
          id: dbUser.id,
          username: dbUser.username,
          avatar: dbUser.avatar,
          status: 'online',
          currentRoom: 'general',
          joinedAt: new Date().toISOString()
        });

        // Join default general room
        socket.join('general');

        // Broadcast updated presence to all clients
        await broadcastPresence(io);

        // Notify room members
        io.to('general').emit('user_joined_room', {
          user: activeUsers.get(socket.id),
          room: 'general',
          message: `${username} joined the chat`
        });

        if (callback) {
          callback({
            success: true,
            user: activeUsers.get(socket.id)
          });
        }
      } catch (error) {
        console.error('Error handling user_login:', error);
        if (callback) callback({ success: false, error: 'Failed to process login' });
      }
    });

    // Join a specific room
    socket.on('join_room', async ({ room }, callback) => {
      try {
        const user = activeUsers.get(socket.id);
        const targetRoom = (room || 'general').trim();

        if (user) {
          const previousRoom = user.currentRoom;
          if (previousRoom && previousRoom !== targetRoom) {
            socket.leave(previousRoom);
            io.to(previousRoom).emit('user_left_room', {
              user,
              room: previousRoom,
              message: `${user.username} left #${previousRoom}`
            });
          }

          socket.join(targetRoom);
          user.currentRoom = targetRoom;
          activeUsers.set(socket.id, user);

          // Notify target room
          io.to(targetRoom).emit('user_joined_room', {
            user,
            room: targetRoom,
            message: `${user.username} joined #${targetRoom}`
          });

          // Broadcast presence & room users
          await broadcastPresence(io);
          emitRoomUsers(io, targetRoom);
        } else {
          socket.join(targetRoom);
        }

        if (callback) callback({ success: true, room: targetRoom });
      } catch (error) {
        console.error('Error joining room:', error);
        if (callback) callback({ success: false, error: 'Failed to join room' });
      }
    });

    // Handle incoming chat message
    socket.on('send_message', async (messageData, callback) => {
      try {
        const { room, sender, senderAvatar, content } = messageData;

        if (!room || !sender || !content || !content.trim()) {
          if (callback) callback({ success: false, error: 'Missing required message fields' });
          return;
        }

        // Persist message to SQLite
        const savedMessage = await MessageModel.create({
          room: room.trim(),
          sender: sender.trim(),
          senderAvatar: senderAvatar || null,
          content: content.trim(),
          status: 'delivered'
        });

        // Broadcast to all clients in this room (including sender)
        io.to(savedMessage.room).emit('receive_message', savedMessage);

        if (callback) {
          callback({ success: true, data: savedMessage });
        }
      } catch (error) {
        console.error('Error sending socket message:', error);
        socket.emit('socket_error', { message: 'Failed to send message' });
        if (callback) callback({ success: false, error: 'Failed to send message' });
      }
    });

    // Typing start indicator
    socket.on('typing_start', ({ room, username }) => {
      if (room && username) {
        socket.to(room).emit('user_typing_start', {
          room,
          username,
          userId: socket.id
        });
      }
    });

    // Typing stop indicator
    socket.on('typing_stop', ({ room, username }) => {
      if (room && username) {
        socket.to(room).emit('user_typing_stop', {
          room,
          username,
          userId: socket.id
        });
      }
    });

    // Message read receipt
    socket.on('message_read', async ({ messageId, room, readBy }) => {
      try {
        if (messageId) {
          const updated = await MessageModel.updateStatus(messageId, 'read');
          if (updated && room) {
            io.to(room).emit('message_status_updated', {
              messageId,
              status: 'read',
              readBy
            });
          }
        }
      } catch (err) {
        console.error('Error updating message status:', err);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async (reason) => {
      const user = activeUsers.get(socket.id);
      if (user) {
        console.log(`👋 User disconnected: ${user.username} (Socket: ${socket.id}) - Reason: ${reason}`);
        activeUsers.delete(socket.id);

        // Update database user status to offline
        try {
          await UserModel.updateStatus(user.username, 'offline');
        } catch (err) {
          console.error('Error updating offline status in DB:', err);
        }

        if (user.currentRoom) {
          io.to(user.currentRoom).emit('user_left_room', {
            user,
            room: user.currentRoom,
            message: `${user.username} left the chat`
          });
          emitRoomUsers(io, user.currentRoom);
        }

        await broadcastPresence(io);
      } else {
        console.log(`👋 Connection closed: Socket ${socket.id}`);
      }
    });
  });
};

// Helper: Get sanitized online users list
export const getOnlineUsersList = () => {
  const uniqueUsers = new Map();
  for (const user of activeUsers.values()) {
    uniqueUsers.set(user.username.toLowerCase(), {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      status: 'online',
      currentRoom: user.currentRoom,
      joinedAt: user.joinedAt
    });
  }
  return Array.from(uniqueUsers.values());
};

// Helper: Broadcast unified presence (online & offline members) to all clients
export const broadcastPresence = async (io) => {
  try {
    const allDbUsers = await UserModel.getAll();
    const onlineList = getOnlineUsersList();
    const onlineMap = new Map(onlineList.map(u => [u.username.toLowerCase(), u]));

    const mergedPresence = allDbUsers.map(user => {
      const isOnline = onlineMap.has(user.username.toLowerCase());
      const liveInfo = onlineMap.get(user.username.toLowerCase());

      return {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        status: isOnline ? 'online' : 'offline',
        currentRoom: liveInfo?.currentRoom || null,
        lastSeenAt: isOnline ? new Date().toISOString() : user.lastSeenAt
      };
    });

    io.emit('presence_update', {
      users: mergedPresence,
      onlineUsers: onlineList,
      onlineCount: onlineList.length,
      totalCount: mergedPresence.length
    });
  } catch (err) {
    console.error('Error broadcasting presence:', err);
  }
};

// Helper: Emit users in a room
const emitRoomUsers = (io, room) => {
  const roomUsers = [];
  for (const user of activeUsers.values()) {
    if (user.currentRoom === room) {
      roomUsers.push(user);
    }
  }
  io.to(room).emit('room_users', { room, count: roomUsers.length, users: roomUsers });
};
