import { NextResponse } from 'next/server';
import '../../../lib/db-schema';

export async function GET() {
  console.log('API route /api/db-init/route.js è stata chiamata!');
  return NextResponse.json({ message: 'Database initialization attempted' });
}