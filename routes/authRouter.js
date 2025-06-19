import express from 'express';
import { register, login, logout, getCurrent, uploadAvatar } from '../controllers/authControllers.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/current', authenticate, getCurrent);
router.patch('/avatars', authenticate, upload.single('avatar'), uploadAvatar);

export default router; 