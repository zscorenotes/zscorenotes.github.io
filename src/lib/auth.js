import crypto from 'crypto';

const SECRET_KEY = process.env.ADMIN_SECRET_KEY || '';
const SESSION_DURATION = 3600000; // 1 hour

/**
 * Hash a password using HMAC-SHA256
 */
export function hashPassword(password) {
  return crypto.createHmac('sha256', SECRET_KEY).update(password).digest('hex');
}

/**
 * Verify a password against the stored hash
 */
export function verifyPassword(password) {
  const storedHash = process.env.ADMIN_PASSWORD_HASH || '';
  const inputHash = hashPassword(password);
  // Timing-safe comparison to prevent timing attacks
  if (storedHash.length !== inputHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(inputHash));
}

/**
 * Create a signed session token
 */
export function createSessionToken() {
  const payload = {
    sub: 'admin',
    iat: Date.now(),
    exp: Date.now() + SESSION_DURATION,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verify a session token's signature and expiry
 * Returns the payload if valid, null otherwise
 */
export function verifySessionToken(token) {
  if (!token || !SECRET_KEY) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [data, signature] = parts;

  // Verify signature
  const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  // Decode and check expiry
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Cookie options for the session token
 */
export function getTokenCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    name: 'zscore_admin_token',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION / 1000, // seconds
  };
}
