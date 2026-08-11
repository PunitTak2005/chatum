// Configure backend URL (replace with your deployed cloud URL or LAN IP, e.g. http://192.168.1.100:9001)
export const BACKEND_URL = 'http://10.0.2.2:9001'; // Default for Android Emulator; change to cloud URL for APK

export const api = {
  async login(username, avatar, backendUrl = BACKEND_URL) {
    const res = await fetch(`${backendUrl}/api/auth/login`, {
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

  async updateProfile(currentUsername, newUsername, avatar, backendUrl = BACKEND_URL) {
    const res = await fetch(`${backendUrl}/api/auth/profile`, {
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

  async getRooms(backendUrl = BACKEND_URL) {
    const res = await fetch(`${backendUrl}/api/rooms`);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    const data = await res.json();
    return data.data;
  },

  async getMessages(room = 'general', limit = 50, offset = 0, backendUrl = BACKEND_URL) {
    const res = await fetch(`${backendUrl}/api/messages?room=${encodeURIComponent(room)}&limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    return data.data;
  }
};
