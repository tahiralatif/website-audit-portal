import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { getUserByEmail, createUser, setUserToken } = await import('@/lib/db');
    const bcrypt = (await import('bcryptjs')).default;
    const { randomUUID } = await import('crypto');

    const token = request.cookies.get('token')?.value;
    if (token) {
      return NextResponse.json({ error: 'Already signed in' }, { status: 400 });
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = createUser({ name, email, passwordHash });

    const newToken = randomUUID();
    setUserToken(user.id, newToken);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });

    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
