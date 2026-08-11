import React from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Users, Hash, Clock, Circle } from 'lucide-react';

export const UserPresenceList = ({ isOpen }) => {
  const { onlineUsers, offlineUsers, allUsers } = useSocket();
  const { user: currentUser } = useAuth();

  if (!isOpen) return null;

  // Robust ISO / SQLite UTC parser
  const parseDbDate = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === 'string') {
      // If SQLite format 'YYYY-MM-DD HH:MM:SS' without timezone, treat as UTC
      if (!dateStr.includes('Z') && !dateStr.includes('+')) {
        return new Date(dateStr.replace(' ', 'T') + 'Z');
      }
    }
    return new Date(dateStr);
  };

  // Formats exact time (e.g. "Last seen at 5:45 PM", "Yesterday at 5:45 PM", "Aug 11 at 5:45 PM")
  const formatLastSeen = (isoString) => {
    if (!isoString) return 'Offline';
    try {
      const date = parseDbDate(isoString);
      if (!date || isNaN(date.getTime())) return 'Offline';

      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

      if (isToday) {
        return `Last seen at ${timeStr}`;
      }

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${timeStr}`;
      }

      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${dateStr} at ${timeStr}`;
    } catch {
      return 'Offline';
    }
  };

  return (
    <aside className="presence-sidebar">
      {/* Header */}
      <div className="presence-header">
        <span>Members</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="online-badge" title="Online members">
            🟢 {onlineUsers.length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            / {allUsers.length || onlineUsers.length}
          </span>
        </div>
      </div>

      <div className="presence-list" style={{ overflowY: 'auto' }}>
        {/* 1. ONLINE USERS SECTION */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ padding: '6px 12px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--success)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
            <span>Online — {onlineUsers.length}</span>
          </div>

          {onlineUsers.map((user, idx) => {
            const isSelf = user.username?.toLowerCase() === currentUser?.username?.toLowerCase();
            return (
              <div key={user.id || idx} className="presence-item">
                <div className="user-avatar-wrapper">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.username}
                    className="user-avatar"
                    style={{ width: 34, height: 34 }}
                  />
                  <span className="status-dot pulse" style={{ width: 8, height: 8 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                  <div className="presence-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.username} {isSelf && <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>(You)</span>}
                    </span>
                  </div>
                  <div className="presence-room" style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--accent-cyan)' }}>
                    <Hash size={11} />
                    <span>{user.currentRoom || 'general'}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {onlineUsers.length === 0 && (
            <div style={{ padding: '8px 12px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              No users currently online
            </div>
          )}
        </div>

        {/* 2. OFFLINE USERS SECTION */}
        {offlineUsers.length > 0 && (
          <div>
            <div style={{ padding: '6px 12px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-dim)' }} />
              <span>Offline — {offlineUsers.length}</span>
            </div>

            {offlineUsers.map((user, idx) => (
              <div key={user.id || idx} className="presence-item" style={{ opacity: 0.75 }}>
                <div className="user-avatar-wrapper">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.username}
                    className="user-avatar"
                    style={{ width: 34, height: 34, filter: 'grayscale(0.35)' }}
                  />
                  <span
                    className="status-dot"
                    style={{
                      width: 8,
                      height: 8,
                      background: 'var(--text-dim)',
                      border: '2px solid var(--bg-sidebar)'
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                  <div className="presence-name" style={{ color: 'var(--text-muted)' }}>
                    {user.username}
                  </div>
                  <div
                    className="presence-room"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: 'var(--text-dim)',
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={formatLastSeen(user.lastSeenAt)}
                  >
                    <Clock size={11} style={{ flexShrink: 0 }} />
                    <span>{formatLastSeen(user.lastSeenAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
