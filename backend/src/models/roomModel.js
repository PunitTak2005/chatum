import { query, getOne, run } from '../config/database.js';

export const RoomModel = {
  async getAll() {
    return await query('SELECT * FROM rooms ORDER BY createdAt ASC');
  },

  async getById(id) {
    return await getOne('SELECT * FROM rooms WHERE id = ?', [id]);
  },

  async create({ id, name, description }) {
    await run(
      'INSERT INTO rooms (id, name, description) VALUES (?, ?, ?)',
      [id, name, description || '']
    );
    return await this.getById(id);
  },

  async delete(id) {
    await run('DELETE FROM messages WHERE room = ?', [id]);
    return await run('DELETE FROM rooms WHERE id = ?', [id]);
  },

  async resetToDefaults() {
    await run("DELETE FROM rooms WHERE id NOT IN ('general', 'tech', 'random')");
    return await this.getAll();
  }
};
