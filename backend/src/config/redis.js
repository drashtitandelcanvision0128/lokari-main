import { createClient } from 'redis';

let client = null;
let memoryStore = null;

/** In-memory fallback when Redis is unavailable (local dev without Docker). */
function getMemoryStore() {
  if (!memoryStore) {
    memoryStore = new Map();
  }
  return memoryStore;
}

export function isRedisConnected() {
  return client?.isReady === true;
}

export async function connectRedis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn('REDIS_URL not set — OTP will use in-memory storage (dev only)');
    return null;
  }

  client = createClient({ url });

  client.on('error', (err) => {
    console.error('Redis error:', err.message);
  });

  try {
    await client.connect();
    console.log('Redis connected');
    return client;
  } catch (err) {
    console.warn('Redis unavailable — falling back to in-memory OTP storage:', err.message);
    client = null;
    return null;
  }
}

export async function disconnectRedis() {
  if (client?.isOpen) {
    await client.quit();
  }
  client = null;
}

export async function redisSet(key, value, ttlSeconds) {
  if (client?.isReady) {
    await client.set(key, value, { EX: ttlSeconds });
    return;
  }

  const store = getMemoryStore();
  const expiresAt = Date.now() + ttlSeconds * 1000;
  store.set(key, { value, expiresAt });

  setTimeout(() => {
    store.delete(key);
  }, ttlSeconds * 1000).unref?.();
}

export async function redisGet(key) {
  if (client?.isReady) {
    return client.get(key);
  }

  const entry = getMemoryStore().get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    getMemoryStore().delete(key);
    return null;
  }
  return entry.value;
}

export async function redisDel(key) {
  if (client?.isReady) {
    await client.del(key);
    return;
  }
  getMemoryStore().delete(key);
}

export async function redisIncr(key, ttlSeconds) {
  if (client?.isReady) {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, ttlSeconds);
    }
    return count;
  }

  const store = getMemoryStore();
  const entry = store.get(key);
  const now = Date.now();
  if (!entry || now > entry.expiresAt) {
    store.set(key, { value: 1, expiresAt: now + ttlSeconds * 1000 });
    return 1;
  }
  entry.value += 1;
  return entry.value;
}
