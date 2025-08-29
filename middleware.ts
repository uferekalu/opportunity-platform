import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  console.log('Middleware triggered for:', request.nextUrl.pathname);
  const token = request.cookies.get('token')?.value;
  console.log('Token:', token);

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('No token, redirecting to /auth');
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
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