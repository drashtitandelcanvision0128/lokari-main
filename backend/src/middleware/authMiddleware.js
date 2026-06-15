import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

/** Cookie options — keep in sync with generateToken.js */
export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/** Read JWT from Authorization header or httpOnly cookie. */
export const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return req.cookies?.jwt ?? null;
};

/**
 * Verify JWT and attach active user to req.user.
 * req.user shape: { user_id, role, email, is_active, is_deleted }
 */
export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Support legacy tokens that used `id` instead of `user_id`
    const userId = decoded.user_id ?? decoded.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        role: true,
        email: true,
        is_active: true,
        is_deleted: true,
      },
    });

    if (!user || user.is_deleted) {
      return res.status(401).json({
        success: false,
        message: 'Account not found',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account suspended',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/** Restrict route to one or more UserRole enum values (e.g. 'ADMIN', 'FARMER'). */
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }
    next();
  };

/** Shorthand for admin-only routes (requires UserRole.ADMIN in database). */
export const requireAdmin = requireRole('ADMIN');
