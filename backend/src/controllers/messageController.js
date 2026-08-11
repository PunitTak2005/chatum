import { MessageModel } from '../models/messageModel.js';

export const getMessages = async (req, res) => {
  try {
    const { room = 'general', limit = 50, offset = 0 } = req.query;

    const messages = await MessageModel.getByRoom(room, limit, offset);
    res.json({
      success: true,
      room,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { room, sender, senderAvatar, content } = req.body;

    if (!room || !sender || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'room, sender, and content are required fields'
      });
    }

    const message = await MessageModel.create({
      room: room.trim(),
      sender: sender.trim(),
      senderAvatar: senderAvatar || null,
      content: content.trim(),
      status: 'delivered'
    });

    // If socket.io instance is attached to app, broadcast in real-time
    const io = req.app.get('io');
    if (io) {
      io.to(message.room).emit('receive_message', message);
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { room = 'general', q = '', limit = 20 } = req.query;
    if (!q.trim()) {
      return res.json({ success: true, data: [] });
    }

    const results = await MessageModel.search(room, q.trim(), limit);
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to search messages' });
  }
};

export const clearMessages = async (req, res) => {
  try {
    const { room } = req.query;
    if (room && room !== 'all') {
      await MessageModel.deleteByRoom(room.trim());
    } else {
      await MessageModel.deleteAll();
    }

    // Broadcast clear event to room if socket io exists
    const io = req.app.get('io');
    if (io) {
      if (room && room !== 'all') {
        io.to(room.trim()).emit('messages_cleared', { room: room.trim() });
      } else {
        io.emit('messages_cleared', { room: 'all' });
      }
    }

    res.json({
      success: true,
      message: room && room !== 'all' ? `Messages in #${room} cleared` : 'All chat history cleared'
    });
  } catch (error) {
    console.error('Error clearing messages:', error);
    res.status(500).json({ success: false, error: 'Failed to clear messages' });
  }
};
