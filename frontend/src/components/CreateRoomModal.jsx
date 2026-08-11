import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useSocket } from '../context/SocketContext.jsx';
import { Hash, X } from 'lucide-react';

export const CreateRoomModal = ({ isOpen, onClose }) => {
  const { refreshRooms, switchRoom } = useSocket();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Room name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newRoom = await api.createRoom({
        name: name.trim(),
        description: description.trim()
      });
      await refreshRooms();
      switchRoom(newRoom.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="modal-title" style={{ margin: 0, fontSize: '1.2rem' }}>
            Create New Channel
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Channel Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. design-system, gaming, project-x"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Topic / Description (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="What is this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={80}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: 16 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
