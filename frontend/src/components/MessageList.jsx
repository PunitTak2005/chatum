import React, { useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { MessageItem } from './MessageItem.jsx';
import { MessageSquare } from 'lucide-react';

export const MessageList = ({ searchQuery }) => {
  const { messages, isLoadingMessages, currentRoom, rooms } = useSocket();
  const scrollRef = useRef(null);

  const currentRoomData = rooms.find((r) => r.id === currentRoom) || { name: currentRoom };

  // Scroll to bottom on initial load and when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoadingMessages]);

  // Format date header helper
  const getDateLabel = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch {
      return '';
    }
  };

  // Filter messages based on search query
  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sender?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="messages-scroll" ref={scrollRef}>
      {isLoadingMessages ? (
        <div className="empty-state">
          <div className="typing-dots" style={{ marginBottom: 12 }}>
            <div className="typing-dot" style={{ width: 10, height: 10 }} />
            <div className="typing-dot" style={{ width: 10, height: 10 }} />
            <div className="typing-dot" style={{ width: 10, height: 10 }} />
          </div>
          <p>Loading channel messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <MessageSquare size={32} />
          </div>
          <h3 style={{ color: 'var(--text-main)', marginBottom: 6 }}>
            {searchQuery ? 'No matching messages found' : `Welcome to #${currentRoomData.name}!`}
          </h3>
          <p style={{ maxWidth: 360, fontSize: '0.88rem' }}>
            {searchQuery
              ? `No messages matched "${searchQuery}". Try a different keyword.`
              : 'This is the start of the channel history. Send a message to get the conversation started!'}
          </p>
        </div>
      ) : (
        filteredMessages.map((msg, index) => {
          const prevMsg = filteredMessages[index - 1];
          const showDateDivider =
            !prevMsg ||
            getDateLabel(prevMsg.timestamp) !== getDateLabel(msg.timestamp);

          return (
            <React.Fragment key={msg.id || index}>
              {showDateDivider && (
                <div className="message-group-divider">
                  <span className="divider-date">
                    {getDateLabel(msg.timestamp)}
                  </span>
                </div>
              )}
              <MessageItem message={msg} searchQuery={searchQuery} />
            </React.Fragment>
          );
        })
      )}
    </div>
  );
};
