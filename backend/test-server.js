import http from 'http';
import { io } from 'socket.io-client';

const PORT = 9001;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('🧪 Starting Full-Stack Chat Server Verification Tests...\n');

  // Test 1: Health Check
  console.log('▶ Test 1: Health Check Endpoint (GET /api/health)');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log('Status Code:', healthRes.status);
  console.log('Response:', healthData);
  if (healthData.status !== 'ok') throw new Error('Health check failed');
  console.log('✅ Health Check Passed!\n');

  // Test 2: Fetch Rooms
  console.log('▶ Test 2: Fetch Rooms (GET /api/rooms)');
  const roomsRes = await fetch(`${BASE_URL}/api/rooms`);
  const roomsData = await roomsRes.json();
  console.log('Rooms Count:', roomsData.data?.length);
  console.log('Rooms:', roomsData.data?.map(r => r.name));
  if (!roomsData.success || !Array.isArray(roomsData.data)) throw new Error('Fetch rooms failed');
  console.log('✅ Fetch Rooms Passed!\n');

  // Test 3: Create Custom Room
  console.log('▶ Test 3: Create Room (POST /api/rooms)');
  const testRoomName = `temp-test-room-${Date.now().toString().slice(-4)}`;
  const createRoomRes = await fetch(`${BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: testRoomName, description: 'Temporary test channel' })
  });
  const newRoomData = await createRoomRes.json();
  console.log('Created Room:', newRoomData);
  if (!newRoomData.success) throw new Error('Create room failed');
  console.log('✅ Create Room Passed!\n');

  // Test 4: Send Message via REST API
  console.log('▶ Test 4: Send Message via REST API (POST /api/messages)');
  const postMsgRes = await fetch(`${BASE_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room: 'general',
      sender: 'TestRunnerBot',
      content: 'Hello world from automated API verification test!'
    })
  });
  const sentMsgData = await postMsgRes.json();
  console.log('Sent Message Result:', sentMsgData);
  if (!sentMsgData.success || !sentMsgData.data?.id) throw new Error('Send message API failed');
  console.log('✅ REST Send Message Passed!\n');

  // Test 5: Fetch Messages History via REST API
  console.log('▶ Test 5: Fetch History (GET /api/messages?room=general)');
  const getMsgsRes = await fetch(`${BASE_URL}/api/messages?room=general`);
  const getMsgsData = await getMsgsRes.json();
  console.log('Fetched Messages Count:', getMsgsData.count);
  const foundMsg = getMsgsData.data?.find(m => m.id === sentMsgData.data.id);
  if (!foundMsg) throw new Error('Message not found in history');
  console.log('✅ Message Persistence Verified in SQLite!\n');

  // Test 6: Search Messages
  console.log('▶ Test 6: Search Messages (GET /api/messages/search)');
  const searchRes = await fetch(`${BASE_URL}/api/messages/search?room=general&q=automated`);
  const searchData = await searchRes.json();
  console.log('Search Results Count:', searchData.count);
  if (!searchData.success || searchData.count === 0) throw new Error('Search failed to find message');
  console.log('✅ Message Search Passed!\n');

  // Test 7: Real-Time Socket.io Multi-Client Test
  console.log('▶ Test 7: Real-Time Socket.io Multi-Client Communication Test');
  await new Promise((resolve, reject) => {
    const clientA = io(BASE_URL);
    const clientB = io(BASE_URL);
    let messageReceivedByB = false;
    let typingReceivedByB = false;

    clientA.on('connect', () => {
      clientA.emit('user_login', { username: 'Alice' }, () => {
        clientA.emit('join_room', { room: 'general' });
      });
    });

    clientB.on('connect', () => {
      clientB.emit('user_login', { username: 'Bob' }, () => {
        clientB.emit('join_room', { room: 'general' });

        setTimeout(() => {
          clientA.emit('typing_start', { room: 'general', username: 'Alice' });
          setTimeout(() => {
            clientA.emit('send_message', {
              room: 'general',
              sender: 'Alice',
              content: 'Hey Bob, Socket.io is blazing fast! ⚡'
            });
          }, 300);
        }, 300);
      });
    });

    clientB.on('user_typing_start', ({ username }) => {
      typingReceivedByB = true;
    });

    clientB.on('receive_message', (msg) => {
      if (msg.sender === 'Alice' && msg.content.includes('blazing fast')) {
        messageReceivedByB = true;
      }

      if (messageReceivedByB && typingReceivedByB) {
        clientA.disconnect();
        clientB.disconnect();
        resolve();
      }
    });

    setTimeout(() => {
      clientA.disconnect();
      clientB.disconnect();
      if (!messageReceivedByB) reject(new Error('Socket real-time message test timed out'));
      else resolve();
    }, 5000);
  });

  // Test 8: Username Dummy Authentication Endpoint (POST /api/auth/login)
  console.log('▶ Test 8: Username Dummy Authentication (POST /api/auth/login)');
  const authRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'TestAuthUser',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TestAuthUser'
    })
  });
  const authData = await authRes.json();
  console.log('Auth Response:', authData);
  if (!authData.success || !authData.token || authData.user?.username !== 'TestAuthUser') {
    throw new Error('Dummy auth login failed');
  }
  console.log('✅ Username Dummy Authentication Passed!\n');

  // CLEANUP: Clean temporary test resources created during verification
  console.log('▶ Cleaning up temporary test artifacts...');
  if (newRoomData.data?.id) {
    await fetch(`${BASE_URL}/api/rooms/${newRoomData.data.id}`, { method: 'DELETE' });
  }
  await fetch(`${BASE_URL}/api/messages`, { method: 'DELETE' });
  await fetch(`${BASE_URL}/api/auth/users`, { method: 'DELETE' });
  console.log('✅ Test artifacts cleaned up successfully!\n');

  console.log('🎉 ALL BACKEND, AUTH & SOCKET.IO VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
