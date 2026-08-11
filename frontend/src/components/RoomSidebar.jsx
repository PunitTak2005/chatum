import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { CreateRoomModal } from './CreateRoomModal.jsx';
import { EditProfileModal } from './EditProfileModal.jsx';
import { MessageSquare, Hash, Plus, LogOut, Settings, Radio, Globe } from 'lucide-react';

export const RoomSidebar = ({ isOpen, onCloseMobile }) => {
  const { rooms, currentRoom, switchRoom, isConnected } = useSocket();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleRoomClick = (roomId) => {
    switchRoom(roomId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="app-brand">
            <div className="app-logo">
              <img src="/avatars/chatum.png" alt="Chatum Logo" />
            </div>
            <div>
              <div className="app-title">Chatum</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: isConnected ? 'var(--success)' : 'var(--warning)', marginTop: 2 }}>
                <span className={`status-dot ${isConnected ? 'pulse' : ''}`} style={{ position: 'static', width: 7, height: 7 }} />
                {isConnected ? 'Real-Time Connected' : 'Connecting...'}
              </div>
            </div>
          </div>
        </div>

        {/* Channels Section */}
        <div className="sidebar-section">
          <span className="sidebar-section-title">Channels</span>
          <button
            className="icon-btn-add"
            title="Create Channel"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Rooms List */}
        <ul className="room-list">
          {rooms.map((room) => (
            <li
              key={room.id}
              className={`room-item ${currentRoom === room.id ? 'active' : ''}`}
              onClick={() => handleRoomClick(room.id)}
            >
              <Hash size={18} className="room-icon" />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {room.name}
              </span>
            </li>
          ))}
        </ul>

        {/* User Profile / Status Bar */}
        {user && (
          <div className="user-profile-bar">
            <div
              className="user-avatar-wrapper"
              onClick={() => setIsEditProfileOpen(true)}
              style={{ cursor: 'pointer' }}
              title="Click to edit profile"
            >
              <img src={user.avatar} alt={user.username} className="user-avatar" />
              <span className="status-dot" />
            </div>
            <div
              className="user-info"
              onClick={() => setIsEditProfileOpen(true)}
              style={{ cursor: 'pointer' }}
              title="Click to edit profile"
            >
              <div className="user-name">{user.username}</div>
              <div className="user-tag">● Online</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                className="logout-btn"
                title="Edit Profile"
                onClick={() => setIsEditProfileOpen(true)}
                style={{ color: 'var(--text-muted)' }}
              >
                <Settings size={18} />
              </button>
              <button className="logout-btn" title="Logout" onClick={logout}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {isOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}

      <CreateRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </>
  );
};
