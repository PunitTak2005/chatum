import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import roomRoutes from './routes/roomRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { getOnlineUsersList } from './sockets/chatSocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createApp = () => {
  const app = express();

  // Middlewares
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(morgan('dev'));

  // Serve static assets (e.g. avatars, logo)
  app.use(express.static(path.resolve(__dirname, '../public')));

  // Root & Info endpoints
  app.get('/', (req, res) => {
    res.json({
      success: true,
      service: 'Chatum Real-Time Backend API',
      status: 'operational',
      health: '/api/health',
      version: '1.0.0',
      endpoints: {
        health: 'GET /api/health',
        authLogin: 'POST /api/auth/login',
        updateProfile: 'PUT /api/auth/profile',
        allUsers: 'GET /api/auth/users',
        onlineUsers: 'GET /api/users/online',
        rooms: 'GET /api/rooms',
        messages: 'GET /api/messages?room=general',
        socket: 'ws:// (Socket.io Real-Time Protocol)'
      }
    });
  });

  app.get('/api', (req, res) => {
    res.json({
      success: true,
      message: 'Chatum API Root',
      health: '/api/health'
    });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Chatum Backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Online users endpoint
  app.get('/api/users/online', (req, res) => {
    res.json({
      success: true,
      data: getOnlineUsersList()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/messages', messageRoutes);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
  });

  return app;
};

export default createApp;
