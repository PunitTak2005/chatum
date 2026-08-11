import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { Check, CheckCheck } from 'lucide-react';

export const MessageItem = ({ message, searchQuery }) => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const isSelf = message.sender === user?.username;

  const isSenderOnline = onlineUsers.some(
    (u) => u.username?.toLowerCase() === message.sender?.toLowerCase()
  );

  // Format message timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Helper to highlight matching text in search
  const renderContent = (content) => {
    if (!searchQuery || !searchQuery.trim()) return content;

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = content.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          style={{
            background: 'rgba(234, 179, 8, 0.4)',
            color: '#fff',
            borderRadius: '2px',
            padding: '0 2px'
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`message-row ${isSelf ? 'outgoing' : 'incoming'}`}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={message.senderAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${message.sender}`}
          alt={message.sender}
          className="msg-avatar"
        />
        <span
          className={`status-dot ${isSenderOnline ? 'pulse' : ''}`}
          style={{
            width: 9,
            height: 9,
            position: 'absolute',
            bottom: 2,
            right: 0,
            background: isSenderOnline ? 'var(--success)' : 'var(--text-dim)',
            border: '2px solid var(--bg-main)'
          }}
          title={isSenderOnline ? 'Online' : 'Offline'}
        />
      </div>

      <div className="msg-content-wrapper">
        <div className="msg-meta">
          <span className="msg-sender">{isSelf ? 'You' : message.sender}</span>
          <span className="msg-time">{formatTime(message.timestamp)}</span>
        </div>

        <div className="msg-bubble">
          {renderContent(message.content)}
        </div>

        {isSelf && (
          <div className="msg-footer">
            <span className="status-ticks">
              {message.status === 'read' ? (
                <CheckCheck size={14} style={{ color: 'var(--accent-cyan)' }} />
              ) : (
                <Check size={14} style={{ color: 'var(--text-dim)' }} />
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
