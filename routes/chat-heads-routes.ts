import { Router } from 'express';
import { validateCreateChatHead } from '../middlewares/chat-heads-middleware';
import controller from '../controllers/chat-heads-controller';
import { verifyAccessToken } from '../utils/chat-helper';

const router = Router();

router.get('/', verifyAccessToken, (req, res) => {
  controller.getChatHeads(req, res);
});

router.post('/', verifyAccessToken, validateCreateChatHead, (req, res) => {
  controller.createChatHead(req, res);
});

router.put('/:chatHead', verifyAccessToken, (req, res) => {
  controller.deleteChatHead(req, res);
});

router.post('/pin/:chatHead', verifyAccessToken, (req, res) => {
  controller.togglePinChatHead(req, res);
});

export default router;
