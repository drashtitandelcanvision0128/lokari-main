import express from 'express';
import { register, login, adminLogin, logout, changePassword, forgotPassword, resetPassword } from '../controllers/authController.js';
import { sendOtpHandler, verifyOtpHandler } from '../controllers/otpController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/logout', logout);
router.post('/otp/send', sendOtpHandler);
router.post('/otp/verify', verifyOtpHandler);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);

export default router;
