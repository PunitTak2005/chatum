const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9001';

export const api = {
  // Username Dummy Authentication
  async login(username, avatar) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, avatar })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Authentication failed');
    }
    return await res.json();
  },

  // Update user profile (username & photo)
  async updateProfile(currentUsername, newUsername, avatar) {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUsername, newUsername, avatar })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    return await res.json();
  },

  // Fetch all registered users
  async getAllUsers() {
    const res = await fetch(`${BASE_URL}/api/auth/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.data;
  },

  // Fetch available rooms
  async getRooms() {
    const res = await fetch(`${BASE_URL}/api/rooms`);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    const data = await res.json();
    return data.data;
  },

  // Create a new room
  async createRoom(roomData) {
    const res = await fetch(`${BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create room');
    }
    const data = await res.json();
    return data.data;
  },

  // Fetch message history for a room
  async getMessages(room = 'general', limit = 50, offset = 0) {
    const res = await fetch(`${BASE_URL}/api/messages?room=${encodeURIComponent(room)}&limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    return data.data;
  },

  // REST send message endpoint
  async sendMessage(messageData) {
    const res = await fetch(`${BASE_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send message');
    }
    const data = await res.json();
    return data.data;
  },

  // Search messages in a room
  async searchMessages(room, query) {
    const res = await fetch(`${BASE_URL}/api/messages/search?room=${encodeURIComponent(room)}&q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search messages');
    const data = await res.json();
    return data.data;
  },

  // Fetch online users
  async getOnlineUsers() {
    const res = await fetch(`${BASE_URL}/api/users/online`);
    if (!res.ok) throw new Error('Failed to fetch online users');
    const data = await res.json();
    return data.data;
  }
};
