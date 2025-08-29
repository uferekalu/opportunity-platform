import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// In-memory rate limiter for Next.js API routes
const rateLimiter = new RateLimiterMemory({
  points: 5, // Max 5 requests
  duration: 60, // Per 60 seconds
  keyPrefix: 'signup',
});

export async function rateLimitMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    await rateLimiter.consume(ip);
    return await handler();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Too many requests, please try again later' },
      { status: 429 }
    );
  }
}