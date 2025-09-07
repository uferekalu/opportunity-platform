import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import { WaitlistEntry } from '@/types';

// Validation schema for POST
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  referralSource: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = waitlistSchema.parse(body);

    // Connect to MongoDB
    const db = await connectToDatabase();
    const waitlistCollection = db.collection('waitlist');

    // Check if email already exists
    const existingEntry = await waitlistCollection.findOne({ email: validatedData.email });
    if (existingEntry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered on waitlist',
        },
        { status: 409 }
      );
    }

    // Get the current count of waitlist entries to determine position
    const waitlistCount = await waitlistCollection.countDocuments();

    // Create new waitlist entry
    const newEntry: WaitlistEntry = {
      id: (await waitlistCollection.countDocuments() + 1).toString(),
      ...validatedData,
      createdAt: new Date(),
      position: waitlistCount + 1,
    };

    // Insert the new entry into MongoDB
    const result = await waitlistCollection.insertOne(newEntry);

    return NextResponse.json({
      success: true,
      data: {
        ...newEntry,
        id: result.insertedId.toString(),
      },
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

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    const db = await connectToDatabase();
    const waitlistCollection = db.collection('waitlist');

    // Get query parameter for email
    const email = request.nextUrl.searchParams.get('email');

    if (email) {
      // Validate email
      const validatedEmail = z.string().email('Invalid email address').parse(email);
      const entry = await waitlistCollection.findOne({ email: validatedEmail });

      if (entry) {
        return NextResponse.json({
          success: true,
          data: {
            entry: {
              id: entry._id.toString(),
              email: entry.email,
              name: entry.name,
              referralSource: entry.referralSource,
              createdAt: entry.createdAt,
              position: entry.position,
            },
          },
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'No waitlist entry found for this email',
          },
          { status: 404 }
        );
      }
    }

    // Get the total number of waitlist entries
    const total = await waitlistCollection.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        total,
      },
    });
  } catch (error) {
    console.error('Waitlist fetch error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email parameter',
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