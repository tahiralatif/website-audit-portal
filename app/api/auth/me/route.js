import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { getUserByToken } = await import('@/lib/db');
    
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = getUserByToken(token);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
