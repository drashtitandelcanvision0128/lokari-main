import { createAndSendOtp, OTP_PURPOSES, verifyOtp } from '../services/otpService.js';

export async function sendOtpHandler(req, res) {
  try {
    const { email, purpose = 'register' } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!OTP_PURPOSES.includes(purpose)) {
      return res.status(400).json({ error: 'Invalid purpose' });
    }

    const result = await createAndSendOtp(email, purpose);

    return res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email',
      data: result,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to send OTP',
    });
  }
}

export async function verifyOtpHandler(req, res) {
  try {
    const { email, otp, purpose = 'register' } = req.body;

    if (!email?.trim() || !otp?.trim()) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const result = await verifyOtp(email, otp, purpose);

    return res.status(200).json({
      status: 'success',
      message: 'OTP verified',
      data: result,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'OTP verification failed',
    });
  }
}
