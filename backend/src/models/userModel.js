import { query, getOne, run } from '../config/database.js';

export const UserModel = {
  async getByUsername(username) {
    return await getOne('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username]);
  },

  async getById(id) {
    return await getOne('SELECT * FROM users WHERE id = ?', [id]);
  },

  async getAll() {
    return await query('SELECT * FROM users ORDER BY status DESC, lastSeenAt DESC LIMIT 100');
  },

  async deleteAll() {
    return await run('DELETE FROM users');
  },

  async updateStatus(username, status) {
    await run(
      'UPDATE users SET status = ?, lastSeenAt = CURRENT_TIMESTAMP WHERE LOWER(username) = LOWER(?)',
      [status, username.trim()]
    );
    return await this.getByUsername(username);
  },

  async updateProfile(currentUsername, { newUsername, avatar }) {
    const user = await this.getByUsername(currentUsername);
    if (!user) throw new Error('User not found');

    const targetUsername = (newUsername || currentUsername).trim();
    const targetAvatar = avatar || user.avatar;

    // Check if newUsername is taken by another user
    if (targetUsername.toLowerCase() !== currentUsername.toLowerCase()) {
      const existing = await this.getByUsername(targetUsername);
      if (existing && existing.id !== user.id) {
        throw new Error('Username is already taken by another user');
      }
    }

    // Update users table
    await run(
      'UPDATE users SET username = ?, avatar = ?, lastSeenAt = CURRENT_TIMESTAMP WHERE id = ?',
      [targetUsername, targetAvatar, user.id]
    );

    // Update messages table so previous messages reflect new username and avatar
    await run(
      'UPDATE messages SET sender = ?, senderAvatar = ? WHERE LOWER(sender) = LOWER(?)',
      [targetUsername, targetAvatar, currentUsername]
    );

    return await this.getById(user.id);
  },

  async createOrUpdate({ username, avatar, status = 'online' }) {
    const trimmedUsername = username.trim();
    const existing = await this.getByUsername(trimmedUsername);

    if (existing) {
      const newAvatar = avatar || existing.avatar;
      await run(
        'UPDATE users SET avatar = ?, status = ?, lastSeenAt = CURRENT_TIMESTAMP WHERE id = ?',
        [newAvatar, status, existing.id]
      );
      return await this.getById(existing.id);
    } else {
      const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const userAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${trimmedUsername}`;
      await run(
        'INSERT INTO users (id, username, avatar, status, lastSeenAt, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [id, trimmedUsername, userAvatar, status]
      );
      return await this.getById(id);
    }
  }
};
