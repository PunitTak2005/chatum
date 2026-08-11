import React from 'react';
import { useSocket } from '../context/SocketContext.jsx';

export const TypingIndicator = () => {
  const { typingUsers } = useSocket();

  if (!typingUsers || typingUsers.length === 0) {
    return <div className="typing-box" style={{ opacity: 0, pointerEvents: 'none' }} />;
  }

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else {
    text = `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;
  }

  return (
    <div className="typing-box">
      <div className="typing-pill">
        <span className="typing-dots">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </span>
        <span className="typing-text">{text}</span>
      </div>
    </div>
  );
};
