import { query, getOne, run } from '../config/database.js';

export const MessageModel = {
  async getByRoom(roomId, limit = 50, offset = 0) {
    const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const safeOffset = Math.max(parseInt(offset) || 0, 0);

    // Retrieve newest messages first, then reverse so client receives chronological order
    const rows = await query(
      `SELECT * FROM messages 
       WHERE room = ? 
       ORDER BY timestamp DESC 
       LIMIT ? OFFSET ?`,
      [roomId, safeLimit, safeOffset]
    );

    return rows.reverse();
  },

  async create({ id, room, sender, senderAvatar, content, status = 'delivered', timestamp }) {
    const messageTimestamp = timestamp || new Date().toISOString();
    const messageId = id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await run(
      `INSERT INTO messages (id, room, sender, senderAvatar, content, status, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [messageId, room, sender, senderAvatar || null, content, status, messageTimestamp]
    );

    return await getOne('SELECT * FROM messages WHERE id = ?', [messageId]);
  },

  async updateStatus(id, status) {
    await run('UPDATE messages SET status = ? WHERE id = ?', [status, id]);
    return await getOne('SELECT * FROM messages WHERE id = ?', [id]);
  },

  async search(roomId, keyword, limit = 20) {
    return await query(
      `SELECT * FROM messages 
       WHERE room = ? AND content LIKE ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [roomId, `%${keyword}%`, limit]
    );
  },

  async deleteAll() {
    return await run('DELETE FROM messages');
  },

  async deleteByRoom(roomId) {
    return await run('DELETE FROM messages WHERE room = ?', [roomId]);
  }
};
