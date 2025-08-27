import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateId } from '@/utils';
import { WaitlistEntry } from '@/types';

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  referralSource: z.string().optional(),
});

// In-memory storage (replace with database in production)
let waitlistEntries: WaitlistEntry[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = waitlistSchema.parse(body);

    // Check if email already exists
    const existingEntry = waitlistEntries.find(entry => entry.email === validatedData.email);
    if (existingEntry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered on waitlist',
        },
        { status: 409 }
      );
    }

    // Create new waitlist entry
    const newEntry = {
      id: generateId(),
      ...validatedData,
      createdAt: new Date(),
      position: waitlistEntries.length + 1,
    };

    waitlistEntries.push(newEntry);

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: 'Successfully joined the waitlist!',
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      total: waitlistEntries.length,
    },
  });
}
