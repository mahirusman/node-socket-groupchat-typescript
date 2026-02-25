import { Router } from 'express';
import {
  validateCreateMessage,
  validateGetMessages,
} from '../middlewares/message-middleware';
import controller from '../controllers/message-controller';
import { verifyAccessToken } from '../utils/chat-helper';

const router = Router();

router.post('/', verifyAccessToken, validateCreateMessage, (req, res) => {
  controller.createMessage(req, res);
});

router.get('/get-message-count', verifyAccessToken, (req, res) => {
  controller.getUnreadMessageCount(req, res);
});

router.get('/:chatHead', verifyAccessToken, validateGetMessages, (req, res) => {
  controller.getMessages(req, res);
});

router.put('/:chatId', verifyAccessToken, validateGetMessages, (req, res) => {
  controller.deleteMessage(req, res);
});

router.post('/seen-by/:message', verifyAccessToken, validateGetMessages, (req, res) => {
  controller.markMessageSeen(req, res);
});

export default router;
