import jwt from 'jsonwebtoken';
import { authCookieOptions } from '../middleware/authMiddleware.js';

/**
 * Sign JWT and set httpOnly cookie.
 * Payload uses user_id + role so protect middleware and controllers stay aligned.
 */
export const generateToken = (user, res) => {
  const payload = {
    user_id: user.user_id,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  res.cookie('jwt', token, authCookieOptions);
  return token;
};
