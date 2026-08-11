import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import roomRoutes from './routes/roomRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { getOnlineUsersList } from './sockets/chatSocket.js';

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
