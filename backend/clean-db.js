import { run, query } from './src/config/database.js';

async function cleanDatabase() {
  console.log('🧹 Purging all demo, test, and user-generated data...');
  
  // 1. Delete all messages
  await run('DELETE FROM messages');
  
  // 2. Delete all users
  await run('DELETE FROM users');
  
  // 3. Delete non-default rooms
  await run("DELETE FROM rooms WHERE id NOT IN ('general', 'tech', 'random')");
  
  // 4. Inspect final state
  const rooms = await query('SELECT * FROM rooms');
  const users = await query('SELECT * FROM users');
  const messages = await query('SELECT * FROM messages');

  console.log('\n✅ Database Audit & Cleanup Complete!');
  console.log(`- Default Channels Remaining (${rooms.length}):`, rooms.map(r => `#${r.name}`));
  console.log(`- Users Remaining: ${users.length}`);
  console.log(`- Messages Remaining: ${messages.length}\n`);

  process.exit(0);
}

cleanDatabase().catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
