import { NextResponse } from 'next/server';
import { verifyPassword, createSessionToken, getTokenCookieOptions } from '@/lib/auth';

// In-memory rate limiting (resets on server restart)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300000; // 5 minutes

function getClientIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

function checkRateLimit(ip) {
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true, remaining: MAX_ATTEMPTS };

  // Reset if lockout has expired
  if (record.lockedUntil && Date.now() > record.lockedUntil) {
    loginAttempts.delete(ip);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  if (record.lockedUntil) {
    const retryAfter = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

function recordFailedAttempt(ip) {
  const record = loginAttempts.get(ip) || { count: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION;
  }
  loginAttempts.set(ip, record);
}

function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

export async function POST(request) {
  const ip = getClientIP(request);

  // Check rate limit
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again later.', retryAfter: rateLimit.retryAfter },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const validUsername = process.env.ADMIN_USERNAME || 'zscore_admin';

    if (username !== validUsername || !verifyPassword(password)) {
      recordFailedAttempt(ip);
      const remaining = MAX_ATTEMPTS - (loginAttempts.get(ip)?.count || 0);
      return NextResponse.json(
        { error: 'Invalid credentials.', remaining: Math.max(0, remaining) },
        { status: 401 }
      );
    }

    // Success — create session token and set cookie
    clearAttempts(ip);
    const token = createSessionToken();
    const cookieOptions = getTokenCookieOptions();

    const response = NextResponse.json({ success: true });
    response.cookies.set(cookieOptions.name, token, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication service error.' },
      { status: 500 }
    );
  }
}
