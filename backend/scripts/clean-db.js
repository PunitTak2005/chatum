import { run, query } from '../src/config/database.js';

async function cleanDatabase() {
  console.log('🧹 Purging all database records (messages, users, custom rooms)...');
  
  await run('DELETE FROM messages');
  await run('DELETE FROM users');
  await run("DELETE FROM rooms WHERE id NOT IN ('general', 'tech', 'random')");

  const rooms = await query('SELECT * FROM rooms');
  const users = await query('SELECT * FROM users');
  const messages = await query('SELECT * FROM messages');

  console.log('\n✅ Database Purged Clean:');
  console.log(`- Default Channels (${rooms.length}):`, rooms.map(r => `#${r.name}`));
  console.log(`- Users Count: ${users.length}`);
  console.log(`- Messages Count: ${messages.length}\n`);

  process.exit(0);
}

cleanDatabase().catch(err => {
  console.error('❌ Clean DB failed:', err);
  process.exit(1);
});
