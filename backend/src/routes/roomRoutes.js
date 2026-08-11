import express from 'express';
import { getRooms, createRoom, deleteRoom } from '../controllers/roomController.js';

const router = express.Router();

router.get('/', getRooms);
router.post('/', createRoom);
router.delete('/:id', deleteRoom);

export default router;
