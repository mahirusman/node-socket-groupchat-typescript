import { Router } from 'express';

import userController from '../controllers/userController';

const router = Router();

router.post('/singup', userController.singup);
router.post('/login', userController.login);

export default router;
