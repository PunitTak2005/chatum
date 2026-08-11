import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { RoomSidebar } from './components/RoomSidebar.jsx';
import { ChatHeader } from './components/ChatHeader.jsx';
import { MessageList } from './components/MessageList.jsx';
import { TypingIndicator } from './components/TypingIndicator.jsx';
import { ChatInput } from './components/ChatInput.jsx';
import { UserPresenceList } from './components/UserPresenceList.jsx';

export const App = () => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPresenceOpen, setIsPresenceOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="app-layout">
      {/* Channels Navigation Sidebar */}
      <RoomSidebar
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat View */}
      <main className="chat-pane">
        <ChatHeader
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onTogglePresence={() => setIsPresenceOpen((prev) => !prev)}
          isPresenceOpen={isPresenceOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="chat-body">
          <div className="messages-area">
            <MessageList searchQuery={searchQuery} />
            <TypingIndicator />
            <ChatInput />
          </div>

          {/* Online Presence Sidebar */}
          <UserPresenceList isOpen={isPresenceOpen} />
        </div>
      </main>
    </div>
  );
};

export default App;
