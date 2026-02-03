import { NextResponse } from 'next/server';
import { verifySessionToken, getTokenCookieOptions } from '@/lib/auth';

export async function GET(request) {
  const cookieName = getTokenCookieOptions().name;
  const token = request.cookies.get(cookieName)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true });
}
