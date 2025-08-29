import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  console.log('Middleware triggered for:', request.nextUrl.pathname);
  const token = request.cookies.get('token')?.value;
  console.log('Token:', token ? 'Present' : 'Missing');

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('No token, redirecting to /auth');
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jwtVerify(token, secret);  // Edge-compatible verification
      console.log('Token verified, proceeding');
      return NextResponse.next();
    } catch (error) {
      console.log('Token verification failed:', error);
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};