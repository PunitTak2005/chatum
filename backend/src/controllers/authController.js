import { UserModel } from '../models/userModel.js';
import { getOnlineUsersList } from '../sockets/chatSocket.js';

export const login = async (req, res) => {
  try {
    const { username, avatar } = req.body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }

    const trimmed = username.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      return res.status(400).json({
        success: false,
        error: 'Username must be between 2 and 30 characters'
      });
    }

    // Dummy Auth: persist user profile with online status
    const user = await UserModel.createOrUpdate({
      username: trimmed,
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${trimmed}`,
      status: 'online'
    });

    const dummyToken = `dummy_token_${Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString('base64')}`;

    res.json({
      success: true,
      message: 'Authentication successful',
      token: dummyToken,
      user
    });
  } catch (error) {
    console.error('Error during dummy login:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await UserModel.getAll();
    const onlineList = getOnlineUsersList();
    const onlineUsernames = new Set(onlineList.map(u => u.username.toLowerCase()));

    // Merge real-time socket presence with persistent DB users
    const usersWithPresence = allUsers.map(user => {
      const isOnline = onlineUsernames.has(user.username.toLowerCase());
      const onlineInfo = isOnline ? onlineList.find(u => u.username.toLowerCase() === user.username.toLowerCase()) : null;

      return {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        status: isOnline ? 'online' : 'offline',
        currentRoom: onlineInfo?.currentRoom || null,
        lastSeenAt: isOnline ? new Date().toISOString() : user.lastSeenAt,
        createdAt: user.createdAt
      };
    });

    res.json({
      success: true,
      count: usersWithPresence.length,
      onlineCount: onlineList.length,
      data: usersWithPresence
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registered users'
    });
  }
};

export const clearAllUsers = async (req, res) => {
  try {
    await UserModel.deleteAll();

    // Broadcast empty presence to connected sockets
    const io = req.app.get('io');
    if (io) {
      io.emit('presence_update', {
        users: [],
        onlineUsers: [],
        onlineCount: 0,
        totalCount: 0
      });
    }

    res.json({
      success: true,
      message: 'All registered users cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear users'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { currentUsername, newUsername, avatar } = req.body;

    if (!currentUsername) {
      return res.status(400).json({ success: false, error: 'Current username is required' });
    }

    if (newUsername && (newUsername.trim().length < 2 || newUsername.trim().length > 30)) {
      return res.status(400).json({ success: false, error: 'Username must be between 2 and 30 characters' });
    }

    const updatedUser = await UserModel.updateProfile(currentUsername, {
      newUsername: newUsername ? newUsername.trim() : currentUsername,
      avatar
    });

    // Broadcast profile update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.emit('profile_updated', {
        oldUsername: currentUsername,
        user: updatedUser
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update profile'
    });
  }
};
