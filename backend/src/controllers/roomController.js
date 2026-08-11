import { RoomModel } from '../models/roomModel.js';

export const getRooms = async (req, res) => {
  try {
    const rooms = await RoomModel.getAll();
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch rooms' });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Room name is required' });
    }

    const roomId = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await RoomModel.getById(roomId);
    if (existing) {
      return res.status(409).json({ success: false, error: 'A room with this name already exists' });
    }

    const room = await RoomModel.create({
      id: roomId,
      name: name.trim(),
      description: description ? description.trim() : ''
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, error: 'Failed to create room' });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (['general', 'tech', 'random'].includes(id)) {
      return res.status(400).json({ success: false, error: 'Default channels cannot be deleted' });
    }

    await RoomModel.delete(id);
    res.json({ success: true, message: `Channel #${id} deleted` });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, error: 'Failed to delete room' });
  }
};
