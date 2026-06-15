import cors from 'cors';

/** Browser Origin headers never include a trailing slash — normalize env values. */
export const normalizeOrigin = (url) => url?.replace(/\/$/, '') ?? '';

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function getAllowedOrigins() {
  return [
    ...(process.env.FRONTEND_URL?.split(',').map((o) => normalizeOrigin(o.trim())) ?? []),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);
}

function isDevLocalOrigin(origin) {
  return LOCALHOST_ORIGIN.test(normalizeOrigin(origin));
}

export function createCorsMiddleware() {
  const allowedOrigins = getAllowedOrigins();
  const isDev = process.env.NODE_ENV !== 'production';
  console.log('CORS allowed origins:', allowedOrigins.join(', ') || '(none — set FRONTEND_URL)');
  if (isDev) {
    console.log('CORS dev mode: any localhost / 127.0.0.1 origin is allowed');
  }

  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      if (isDev && isDevLocalOrigin(normalized)) {
        return callback(null, true);
      }
      console.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      return callback(null, false);
    },
    credentials: true,
  });
}
