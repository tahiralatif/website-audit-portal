import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { listAudits } = await import('@/lib/db');
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const audits = listAudits(limit);
    return NextResponse.json(audits);
  } catch (err) {
    return NextResponse.json([]);
  }
}
