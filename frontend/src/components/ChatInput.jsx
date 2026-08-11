import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { Send, Smile } from 'lucide-react';

const QUICK_EMOJIS = ['👋', '🔥', '🚀', '❤️', '👍', '🎉', '💻', '✨'];

export const ChatInput = () => {
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimerRef = useRef(null);
  const lastEmitRef = useRef(0);
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setContent(value);

    const now = Date.now();

    if (value.trim()) {
      // Emit typing immediately or throttle to at least once every 1.5s while user types
      if (now - lastEmitRef.current > 1500) {
        lastEmitRef.current = now;
        startTyping();
      }

      // Reset inactivity stop timer to 5 seconds
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      typingTimerRef.current = setTimeout(() => {
        lastEmitRef.current = 0;
        stopTyping();
      }, 5000);
    } else {
      // Field is empty -> immediately stop typing
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      lastEmitRef.current = 0;
      stopTyping();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim()) return;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    lastEmitRef.current = 0;
    stopTyping();

    sendMessage(content);
    setContent('');
    setShowEmojiPicker(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const addEmoji = (emoji) => {
    setContent((prev) => {
      const next = prev + emoji;
      startTyping();
      return next;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  return (
    <div className="chat-input-bar">
      {showEmojiPicker && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 10,
            width: 'fit-content'
          }}
        >
          {QUICK_EMOJIS.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addEmoji(emoji)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: 4,
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.25)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="input-container">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          style={{
            background: 'transparent',
            border: 'none',
            color: showEmojiPicker ? 'var(--primary)' : 'var(--text-dim)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            marginRight: 6
          }}
          title="Quick Emojis"
        >
          <Smile size={20} />
        </button>

        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          rows={1}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <div className="input-actions">
          <button
            type="button"
            className="send-btn"
            onClick={handleSend}
            disabled={!content.trim()}
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
