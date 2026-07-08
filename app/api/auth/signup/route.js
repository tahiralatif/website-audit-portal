import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Account creation is disabled in this demo deployment.' },
    { status: 403 }
  );
}
