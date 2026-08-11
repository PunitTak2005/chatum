import express from 'express';
import { login, getAllUsers, clearAllUsers, updateProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.get('/users', getAllUsers);
router.delete('/users', clearAllUsers);
router.put('/profile', updateProfile);

export default router;
