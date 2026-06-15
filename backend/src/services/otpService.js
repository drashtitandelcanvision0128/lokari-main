import crypto from 'crypto';
import { redisDel, redisGet, redisIncr, redisSet } from '../config/redis.js';
import { sendOtpEmail } from './email/index.js';

const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 600);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_RATE_LIMIT = Number(
  process.env.OTP_RATE_LIMIT || (process.env.NODE_ENV === 'production' ? 3 : 10),
);
const OTP_RATE_WINDOW_SECONDS = Number(process.env.OTP_RATE_WINDOW_SECONDS || 900);

export const OTP_PURPOSES = ['register', 'login', 'reset_password'];

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function otpKey(email, purpose) {
  return `otp:${purpose}:${normalizeEmail(email)}`;
}

function rateLimitKey(email) {
  return `otp:rate:${normalizeEmail(email)}`;
}

function registrationVerifiedKey(email) {
  return `otp:verified:register:${normalizeEmail(email)}`;
}

function hashOtp(otp) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'otp-dev-secret';
  return crypto.createHash('sha256').update(`${otp}:${secret}`).digest('hex');
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 999999));
}

export async function createAndSendOtp(email, purpose) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    throw new Error('Email is required');
  }
  if (!OTP_PURPOSES.includes(purpose)) {
    throw new Error('Invalid OTP purpose');
  }

  const sendCount = await redisIncr(rateLimitKey(normalized), OTP_RATE_WINDOW_SECONDS);
  // if (sendCount > OTP_RATE_LIMIT) {
  //   const err = new Error(
  //     `Too many OTP requests (max ${OTP_RATE_LIMIT} per ${OTP_RATE_WINDOW_SECONDS / 60} min). Please try again later.`,
  //   );
  //   err.statusCode = 429;
  //   throw err;
  // }

  const code = generateOtpCode();
  const payload = JSON.stringify({
    hash: hashOtp(code),
    attempts: 0,
    purpose,
  });

  await redisSet(otpKey(normalized, purpose), payload, OTP_TTL_SECONDS);
  await sendOtpEmail(normalized, code, purpose, { expiresInSeconds: OTP_TTL_SECONDS });

  return {
    email: normalized,
    purpose,
    expiresIn: OTP_TTL_SECONDS,
    otp: code,
  };
}

export async function verifyOtp(email, otp, purpose) {
  const normalized = normalizeEmail(email);
  if (!normalized || !otp || !purpose) {
    throw new Error('Email, OTP, and purpose are required');
  }

  const key = otpKey(normalized, purpose);
  const raw = await redisGet(key);
  if (!raw) {
    const err = new Error('OTP expired or not found. Request a new code.');
    err.statusCode = 400;
    throw err;
  }

  const record = JSON.parse(raw);
  if (record.purpose !== purpose) {
    const err = new Error('Invalid OTP purpose');
    err.statusCode = 400;
    throw err;
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await redisDel(key);
    const err = new Error('Too many failed attempts. Request a new OTP.');
    err.statusCode = 429;
    throw err;
  }

  const isValid = hashOtp(String(otp).trim()) === record.hash;
  if (!isValid) {
    record.attempts += 1;
    await redisSet(key, JSON.stringify(record), OTP_TTL_SECONDS);
    const err = new Error('Invalid OTP');
    err.statusCode = 400;
    throw err;
  }

  await redisDel(key);
  if (purpose === 'register') {
    await redisSet(registrationVerifiedKey(normalized), '1', OTP_TTL_SECONDS);
  }
  return { verified: true, email: normalized, purpose };
}

/** Used by POST /auth/register when OTP was verified in a prior step. */
export async function consumeRegistrationVerified(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    throw new Error('Email is required');
  }
  const key = registrationVerifiedKey(normalized);
  const raw = await redisGet(key);
  if (!raw) {
    const err = new Error('Email not verified. Complete OTP verification first.');
    err.statusCode = 400;
    throw err;
  }
  await redisDel(key);
  return { verified: true, email: normalized };
}
