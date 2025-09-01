import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { connectToDatabase } from '@/lib/mongodb';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept the Google OAuth callback
  if (pathname.startsWith('/api/auth/callback/google')) {
    const response = NextResponse.next();

    // Get the user email from the query parameters or session
    const email = request.nextUrl.searchParams.get('email') || request.cookies.get('next-auth.session-token')?.value;

    if (email) {
      // Connect to MongoDB to fetch user
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ email });

      if (user) {
        // Generate JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const jwt = await new SignJWT({
          userId: user._id.toString(),
          email: user.email,
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('7d')
          .sign(secret);

        // Set the token cookie
        response.cookies.set('token', jwt, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });
      }
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/callback/google'],
};