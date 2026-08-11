import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import createApp from './app.js';
import { initDatabase } from './config/database.js';
import { setupChatSocket } from './sockets/chatSocket.js';

// Ensure .env is properly resolved relative to backend folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = parseInt(process.env.PORT, 10) || 9001;
const CLIENT_URL = process.env.CLIENT_URL || '*';

const startServer = async () => {
  try {
    // 1. Initialize SQLite Database
    await initDatabase();

    // 2. Setup Express App
    const app = createApp();
    const server = http.createServer(app);

    // 3. Setup Socket.io Server
    const io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Allow connections from any frontend origin for seamless dev & prod
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Make io accessible in express route handlers
    app.set('io', io);

    // 4. Setup Chat Socket Handlers
    setupChatSocket(io);

    // 5. Server Error Handling (e.g. port conflicts)
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
        console.error(`\n❌ Error: Port ${PORT} is unavailable (${err.code}). Please specify an open port in backend/.env`);
      } else {
        console.error('\n❌ Server error:', err);
      }
      process.exit(1);
    });

    // 6. Start Listening
    server.listen(PORT, () => {
      console.log(`\n=============================================`);
      console.log(`🚀 Chatum Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io ready for real-time connections`);
      console.log(`🌐 Allowed Client Origins: *`);
      console.log(`=============================================\n`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n🛑 Gracefully shutting down server...');
      server.close(() => {
        console.log('✅ HTTP & Socket Server closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
