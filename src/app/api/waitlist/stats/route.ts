import { NextResponse } from 'next/server';

// In-memory storage (should match the one in waitlist/route.ts)
// In a real app, this would be a shared database
let waitlistEntries: any[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      total: waitlistEntries.length,
    },
  });
}
