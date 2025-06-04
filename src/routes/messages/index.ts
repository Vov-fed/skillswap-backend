import express from 'express';
import { getMessagesByChat, getMessageById, searchMessagesInChat } from './get';
import { sendMessage, markMessageRead, markAllReadInChat, reactToMessage } from './post';
import { editMessage, updateMessageStatus, editReaction } from './patch';
import {deleteMessage, deleteMessagesInChat, removeReaction } from './delete';
import { verifyToken } from '../../middleware/authMiddleware';

const router = express.Router();

// ***************GET ROUTES****************

// Get messages by chat ID
router.get('/:chatId', getMessagesByChat);
// Get a specific message by ID
router.get('/message/:messageId', getMessageById);
// Search messages in a chat
router.get('/:chatId/search', searchMessagesInChat);

// ***************POST ROUTES****************

// Send a new message
router.post('/', verifyToken, sendMessage);
// Mark a message as read
router.post('/read/:messageId', markMessageRead);
// Mark all messages in a chat as read
router.post('/read/:chatId', verifyToken, markAllReadInChat);
// React to a message
router.post('/react/:messageId', verifyToken, reactToMessage);
// Edit a message
router.patch('/:messageId', verifyToken, editMessage);
// Update a message status
router.patch('/status/:messageId', verifyToken, updateMessageStatus);
// Edit a reaction on a message
router.patch('/react/:messageId', verifyToken, editReaction);

// ***************DELETE ROUTES****************

// Delete a message
router.delete('/:messageId', verifyToken, deleteMessage);
// Delete all messages in a chat
router.delete('/chat/:chatId', verifyToken, deleteMessagesInChat);
// Remove a reaction from a message
router.delete('/react/:messageId', verifyToken, removeReaction);


export default router;