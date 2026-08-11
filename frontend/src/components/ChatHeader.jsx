import React from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { Hash, Search, Menu, Users, X } from 'lucide-react';

export const ChatHeader = ({
  onToggleSidebar,
  onTogglePresence,
  isPresenceOpen,
  searchQuery,
  onSearchChange
}) => {
  const { currentRoom, rooms, onlineUsers } = useSocket();

  const currentRoomData = rooms.find((r) => r.id === currentRoom) || {
    name: currentRoom,
    description: 'Channel conversations'
  };

  return (
    <header className="chat-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar} title="Toggle Navigation">
          <Menu size={22} />
        </button>

        <div className="header-title-group">
          <h2>
            <Hash size={20} style={{ color: 'var(--primary)' }} />
            {currentRoomData.name}
          </h2>
          <p className="header-desc">{currentRoomData.description || 'Real-time discussions'}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Search Bar */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: 10,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Online Users Button Toggle */}
        <button
          className={`header-action-btn ${isPresenceOpen ? 'active' : ''}`}
          onClick={onTogglePresence}
          title="Online Members"
        >
          <Users size={18} />
          <span>{onlineUsers.length}</span>
        </button>
      </div>
    </header>
  );
};
