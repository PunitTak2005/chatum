import express from 'express';
import { getMessages, sendMessage, searchMessages, clearMessages } from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getMessages);
router.post('/', sendMessage);
router.get('/search', searchMessages);
router.delete('/', clearMessages);

export default router;
