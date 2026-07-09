import { NextResponse } from 'next/server';
import { logServerError } from '@/lib/logger';

export async function GET(request) {
  try {
    const { listAudits, getUserByToken } = await import('@/lib/db');
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    // Filter by authenticated user
    const token = request.cookies.get('token')?.value;
    let userId = null;
    if (token) {
      const user = getUserByToken(token);
      if (user) userId = user.id;
    }

    const audits = listAudits(limit, userId);
    return NextResponse.json(audits);
  } catch (err) {
    logServerError('GET /api/audit/list', err.message);
    return NextResponse.json([]);
  }
}
