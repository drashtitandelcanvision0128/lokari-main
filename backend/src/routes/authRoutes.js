import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { sendOtpHandler, verifyOtpHandler } from "../controllers/otpController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/otp/send", sendOtpHandler);
router.post("/otp/verify", verifyOtpHandler);

export default router;