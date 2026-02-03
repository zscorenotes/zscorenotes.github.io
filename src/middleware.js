import { NextResponse } from 'next/server';

const COOKIE_NAME = 'zscore_admin_token';

// Routes that require authentication (POST/PUT/DELETE only)
const PROTECTED_WRITE_ROUTES = [
  '/api/content-clean',
  '/api/content-html',
  '/api/upload',
  '/api/upload-image',
  '/api/list-blobs',
];

// Routes that allow unauthenticated GET (public site needs to read content)
const PUBLIC_READ_ROUTES = [
  '/api/content-clean',
  '/api/content-html',
];

/**
 * Verify HMAC-SHA256 token using Web Crypto API (Edge-compatible)
 */
async function verifyToken(token, secret) {
  if (!token || !secret) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [data, signature] = parts;

  // Import key for HMAC
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Compute expected signature
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  if (signature !== expectedSignature) return false;

  // Check expiry
  try {
    const payload = JSON.parse(atob(data.replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_WRITE_ROUTES.some(route => pathname.startsWith(route));
  if (!isProtectedRoute) return NextResponse.next();

  // Allow public GET requests for content reading (SSR needs this)
  const isPublicRead = PUBLIC_READ_ROUTES.some(route => pathname.startsWith(route));
  if (isPublicRead && method === 'GET') return NextResponse.next();

  // All other requests to protected routes require authentication
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.ADMIN_SECRET_KEY;

  const isValid = await verifyToken(token, secret);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/content-clean/:path*',
    '/api/content-html/:path*',
    '/api/upload/:path*',
    '/api/upload-image/:path*',
    '/api/list-blobs/:path*',
  ],
};
