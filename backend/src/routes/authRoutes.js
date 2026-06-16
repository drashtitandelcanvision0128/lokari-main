import express from 'express';
import { register, login, logout, changePassword } from '../controllers/authController.js';
import { sendOtpHandler, verifyOtpHandler } from '../controllers/otpController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/otp/send', sendOtpHandler);
router.post('/otp/verify', verifyOtpHandler);
router.put('/change-password', protect, changePassword);

export default router;
