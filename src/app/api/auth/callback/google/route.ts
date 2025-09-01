import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: session.user.email });

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

      // Redirect to dashboard
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      response.cookies.set('token', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return response;
    }
  }

  // Fallback to default NextAuth behavior
  return NextResponse.redirect(new URL('/auth?error=AccessDenied', request.url));
}