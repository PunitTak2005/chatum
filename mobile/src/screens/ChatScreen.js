import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const ChatScreen = () => {
  const { user, logout } = useAuth();
  const {
    currentRoom,
    rooms,
    messages,
    onlineUsers,
    typingUsers,
    isConnected,
    switchRoom,
    sendMessage,
    sendTyping
  } = useSocket();

  const [inputMessage, setInputMessage] = useState('');
  const [showChannelModal, setShowChannelModal] = useState(false);
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
    sendTyping(false);
  };

  const handleInputChange = (text) => {
    setInputMessage(text);
    sendTyping(text.length > 0);
  };

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderMessageItem = ({ item }) => {
    const isMe = item.sender?.toLowerCase() === user?.username?.toLowerCase();
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        {!isMe && (
          <Image
            source={{
              uri: item.senderAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.sender}`
            }}
            style={styles.msgAvatar}
          />
        )}
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          {!isMe && <Text style={styles.msgSender}>{item.sender}</Text>}
          <Text style={styles.msgText}>{item.content}</Text>
          <Text style={styles.msgTime}>{formatMessageTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Chat Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.channelButton}
            onPress={() => setShowChannelModal(true)}
          >
            <Text style={styles.channelHash}>#</Text>
            <Text style={styles.channelTitle}>{currentRoom}</Text>
            <Text style={styles.channelDropdown}>▼</Text>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <View style={styles.statusDotWrapper}>
              <View style={[styles.statusDot, isConnected && styles.statusDotOnline]} />
              <Text style={styles.onlineCount}>{onlineUsers.length} online</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Message Feed */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingBar}>
            <Text style={styles.typingText}>
              ✍️ {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </Text>
          </View>
        )}

        {/* Chat Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder={`Message #${currentRoom}...`}
            placeholderTextColor="#64748b"
            value={inputMessage}
            onChangeText={handleInputChange}
            onSubmitEditing={handleSend}
            multiline={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputMessage.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        {/* Channels Modal */}
        <Modal
          visible={showChannelModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowChannelModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowChannelModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalHeaderTitle}>Select Channel</Text>
              {rooms.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.roomItem,
                    currentRoom === r.id && styles.roomItemActive
                  ]}
                  onPress={() => {
                    switchRoom(r.id);
                    setShowChannelModal(false);
                  }}
                >
                  <Text style={styles.roomHash}>#</Text>
                  <Text style={styles.roomName}>{r.name}</Text>
                  {currentRoom === r.id && <Text style={styles.activeCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0f172a'
  },
  channelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  channelHash: {
    color: '#6366f1',
    fontSize: 20,
    fontWeight: '800'
  },
  channelTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700'
  },
  channelDropdown: {
    color: '#64748b',
    fontSize: 10,
    marginLeft: 4
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  statusDotWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748b'
  },
  statusDotOnline: {
    backgroundColor: '#10b981'
  },
  onlineCount: {
    color: '#94a3b8',
    fontSize: 12
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600'
  },
  messageList: {
    padding: 16,
    gap: 12
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8
  },
  messageRowMe: {
    justifyContent: 'flex-end'
  },
  messageRowOther: {
    justifyContent: 'flex-start'
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8
  },
  msgBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16
  },
  msgBubbleMe: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4
  },
  msgBubbleOther: {
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 4
  },
  msgSender: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2
  },
  msgText: {
    color: '#f8fafc',
    fontSize: 15,
    lineHeight: 20
  },
  msgTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  typingBar: {
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  typingText: {
    color: '#38bdf8',
    fontSize: 12,
    fontStyle: 'italic'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15
  },
  sendButton: {
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  sendButtonDisabled: {
    opacity: 0.4
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  modalHeaderTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6
  },
  roomItemActive: {
    backgroundColor: '#6366f1'
  },
  roomHash: {
    color: '#94a3b8',
    fontSize: 16,
    marginRight: 8
  },
  roomName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  activeCheck: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  }
});
