const router = express.Router();
import express from 'express';
import { getUserAllChats, getUserUnreadChats, messageRead, newMessage, singleChat } from '../controllers/chatController.js';

router.get('/:userId', getUserAllChats);
router.get('/getUserUnreadChats/:userId', getUserUnreadChats);
router.post('/newMessage', newMessage);
router.post('/messageRead', messageRead);
router.get('/singleChat/:user1/:user2', singleChat);

export default router;