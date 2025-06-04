import express from 'express';
import { getChats, getChat } from './get';
import { createChat } from './post';
import { deleteChat } from './delete';
import { verifyToken } from '../../middleware/authMiddleware';

const router = express.Router();

// GET /chats
router.get('/', verifyToken, getChats);
// GET /chats/:chatId
router.get('/:chatId', verifyToken, getChat);

//Post /
router.post('/', verifyToken, createChat)

// DELETE /chats/:chatId
router.delete('/:chatId', verifyToken, deleteChat);
// Export the router
export default router;