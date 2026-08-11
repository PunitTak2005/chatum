import { run, query } from '../src/config/database.js';

const USERS = [
  // General Chat Users
  { username: 'Aarav', avatar: '/avatars/aarav.jpg', status: 'online' },
  { username: 'Riya', avatar: '/avatars/riya.jpg', status: 'online' },
  { username: 'Kabir', avatar: '/avatars/kabir.jpg', status: 'offline' },
  // Tech Talk Users
  { username: 'Neha', avatar: '/avatars/neha.jpg', status: 'online' },
  { username: 'Arjun', avatar: '/avatars/arjun.jpg', status: 'online' },
  { username: 'Vikram', avatar: '/avatars/vikram.jpg', status: 'offline' },
  // Random Chat Users
  { username: 'Rohan', avatar: '/avatars/rohan.jpg', status: 'online' },
  { username: 'Sneha', avatar: '/avatars/sneha.jpg', status: 'online' },
  { username: 'Aman', avatar: '/avatars/aman.jpg', status: 'offline' }
];

const ROOMS = [
  { id: 'general', name: 'General Chat', description: 'Open discussions and casual conversations' },
  { id: 'tech', name: 'Tech Talk', description: 'Coding, frameworks, development & tech' },
  { id: 'random', name: 'Random Chat', description: 'Memes, music, games & off-topic fun' }
];

const CONVERSATIONS = {
  general: [
    { sender: 'Aarav', content: 'anyone else still awake or am i the only one 😭' },
    { sender: 'Riya', content: 'unfortunately yes' },
    { sender: 'Kabir', content: 'same lol' },
    { sender: 'Aarav', content: 'what are you guys doing?' },
    { sender: 'Riya', content: 'supposed to be studying' },
    { sender: 'Kabir', content: 'supposed to be working 💀' },
    { sender: 'Aarav', content: 'so basically nobody is doing what they should be doing' },
    { sender: 'Riya', content: 'pretty much' },
    { sender: 'Kabir', content: 'i spent like 40 mins fixing one tiny bug' },
    { sender: 'Aarav', content: 'what was the bug?' },
    { sender: 'Kabir', content: 'missing ;' },
    { sender: 'Riya', content: 'no way 😭' },
    { sender: 'Kabir', content: "don't remind me" },
    { sender: 'Aarav', content: 'hahaha classic' },
    { sender: 'Riya', content: 'btw did anyone order food yet?' },
    { sender: 'Kabir', content: 'not yet' },
    { sender: 'Aarav', content: "i'm thinking pizza" },
    { sender: 'Riya', content: 'at this hour??' },
    { sender: 'Aarav', content: "there's never a bad time for pizza" },
    { sender: 'Kabir', content: "that's actually true" },
    { sender: 'Riya', content: "okay now i'm hungry" },
    { sender: 'Aarav', content: 'problem solved then' },
    { sender: 'Riya', content: 'absolutely not 😂' },
    { sender: 'Kabir', content: 'anyway i should probably get back to work' },
    { sender: 'Aarav', content: 'you said that half an hour ago' },
    { sender: 'Kabir', content: 'details' },
    { sender: 'Riya', content: '😂' }
  ],
  tech: [
    { sender: 'Neha', content: 'has anyone tried the latest Next.js stuff yet?' },
    { sender: 'Arjun', content: 'a little. the new routing changes are nice but i got confused with server components at first' },
    { sender: 'Vikram', content: "same lol. i kept wondering why my `console.log` wasn't showing in the browser" },
    { sender: 'Neha', content: "😂 that's the part that got me too" },
    { sender: 'Arjun', content: 'btw are you guys still using Redux?' },
    { sender: 'Vikram', content: 'not for small projects' },
    { sender: 'Neha', content: 'same. usually Zustand unless the state gets really complicated' },
    { sender: 'Arjun', content: "i've been using Context for everything and now my app has like 6 providers 💀" },
    { sender: 'Vikram', content: "bro that's a provider tree, not an app" },
    { sender: 'Neha', content: '😂' },
    { sender: 'Arjun', content: 'okay okay, i get the hint' },
    { sender: 'Vikram', content: 'what are you guys using for backend?' },
    { sender: 'Neha', content: 'Node + Express mostly' },
    { sender: 'Arjun', content: 'FastAPI for my current project' },
    { sender: 'Vikram', content: "how's FastAPI?" },
    { sender: 'Arjun', content: 'pretty good actually. type hints make the API code way cleaner' },
    { sender: 'Neha', content: "i've been meaning to try it" },
    { sender: 'Arjun', content: "do it. especially if you're already comfortable with Python" },
    { sender: 'Vikram', content: "meanwhile i'm still fighting Docker" },
    { sender: 'Neha', content: "what's broken?" },
    { sender: 'Vikram', content: 'container works perfectly on my machine' },
    { sender: 'Arjun', content: 'ah yes, the most famous bug' },
    { sender: 'Vikram', content: 'exactly 😭' },
    { sender: 'Neha', content: "what's the actual error?" },
    { sender: 'Vikram', content: 'port 5000 is already being used' },
    { sender: 'Arjun', content: 'check what\'s running on it before changing your Docker config' },
    { sender: 'Vikram', content: 'yep found it' },
    { sender: 'Vikram', content: 'some old node process was still running' },
    { sender: 'Neha', content: 'classic' },
    { sender: 'Vikram', content: 'killed it and everything works now' },
    { sender: 'Arjun', content: 'nice' },
    { sender: 'Neha', content: 'tech support session officially complete 😂' }
  ],
  random: [
    { sender: 'Rohan', content: "okay random question... what's everyone eating rn" },
    { sender: 'Sneha', content: 'nothing 😭' },
    { sender: 'Rohan', content: 'tragic' },
    { sender: 'Aman', content: 'chai and biscuits' },
    { sender: 'Sneha', content: 'at 9pm??' },
    { sender: 'Aman', content: "chai doesn't follow a schedule" },
    { sender: 'Rohan', content: 'fair enough 😂' },
    { sender: 'Sneha', content: "i just realized it's already friday" },
    { sender: 'Aman', content: 'wait seriously?' },
    { sender: 'Rohan', content: 'bro lost track of the entire week 💀' },
    { sender: 'Aman', content: "i've been busy okay" },
    { sender: 'Sneha', content: 'doing what?' },
    { sender: 'Aman', content: 'mostly pretending to be productive' },
    { sender: 'Rohan', content: 'relatable' },
    { sender: 'Sneha', content: 'anyone watching anything good lately?' },
    { sender: 'Rohan', content: 'started a new series yesterday' },
    { sender: 'Aman', content: 'worth watching?' },
    { sender: 'Rohan', content: 'first two episodes are pretty good' },
    { sender: 'Sneha', content: 'name?' },
    { sender: 'Rohan', content: "i'll send it in a sec, can't remember the spelling 😭" },
    { sender: 'Aman', content: '😂' },
    { sender: 'Sneha', content: 'this is why screenshots exist' },
    { sender: 'Rohan', content: 'okay okay, found it' },
    { sender: 'Rohan', content: 'sending now' },
    { sender: 'Aman', content: 'nice, adding it to my weekend list' },
    { sender: 'Sneha', content: 'same' },
    { sender: 'Rohan', content: 'and there goes my weekend plans' },
    { sender: 'Aman', content: 'what plans?' },
    { sender: 'Rohan', content: 'absolutely nothing' },
    { sender: 'Sneha', content: 'honestly, best plan' },
    { sender: 'Aman', content: 'agreed 😂' }
  ]
};

async function seedAll() {
  console.log('🌱 Starting comprehensive database seeding for Chatum...');

  // 1. Seed Rooms
  for (const r of ROOMS) {
    await run(`
      INSERT INTO rooms (id, name, description, createdAt)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description
    `, [r.id, r.name, r.description]);
  }
  console.log('✅ Channels initialized:', ROOMS.map(r => `#${r.name}`));

  // 2. Seed Users
  for (const u of USERS) {
    const existing = await query('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [u.username]);
    if (!existing || existing.length === 0) {
      await run(
        'INSERT INTO users (id, username, avatar, status, lastSeenAt, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [`usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`, u.username, u.avatar, u.status]
      );
    } else {
      await run(
        'UPDATE users SET avatar = ?, status = ?, lastSeenAt = CURRENT_TIMESTAMP WHERE LOWER(username) = LOWER(?)',
        [u.avatar, u.status, u.username]
      );
    }
  }
  console.log('✅ Users initialized with AI avatars:', USERS.map(u => u.username));

  // 3. Seed Conversations
  await run('DELETE FROM messages');
  const avatarMap = new Map(USERS.map(u => [u.username.toLowerCase(), u.avatar]));

  for (const [roomId, messages] of Object.entries(CONVERSATIONS)) {
    const baseTime = Date.now() - (messages.length * 35 * 1000);
    for (let i = 0; i < messages.length; i++) {
      const item = messages[i];
      const msgId = `msg_${roomId}_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`;
      const msgTime = new Date(baseTime + (i * 35 * 1000)).toISOString();
      const avatar = avatarMap.get(item.sender.toLowerCase()) || `/avatars/${item.sender.toLowerCase()}.jpg`;

      await run(
        'INSERT INTO messages (id, room, sender, senderAvatar, content, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [msgId, roomId, item.sender, avatar, item.content, 'read', msgTime]
      );
    }
    console.log(`✅ Seeded ${messages.length} messages into #${roomId}`);
  }

  console.log('\n🎉 Complete database seeding finished successfully!');
  process.exit(0);
}

seedAll().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
