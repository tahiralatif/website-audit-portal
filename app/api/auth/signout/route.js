import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: false, // Enable when HTTPS is configured
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
