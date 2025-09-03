import { connectToDatabase } from '@/lib/mongodb';
import NextAuth, { NextAuthOptions, User, Account, Profile, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { JWT } from 'next-auth/jwt';
import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

// Extend JWT
declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        email?: string;
        name?: string;
        createdAt?: Date;
        token?: string;
    }
}

// Extend Session
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email?: string;
            name?: string;
            createdAt?: Date;
        };
        token?: string;
    }
}

export let newToken: JWT | null = null;

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                const db = await connectToDatabase();
                const usersCollection = db.collection('users');
                const existingUser = await usersCollection.findOne({ email: user.email });

                if (existingUser) {
                    if (existingUser.password) {
                        return false; // deny Google sign-in if password exists
                    }
                    user.id = existingUser._id.toString();
                    return true;
                }

                const newUser = {
                    email: user.email,
                    name: user.name || profile?.name,
                    createdAt: new Date(),
                };
                const result = await usersCollection.insertOne(newUser);
                user.id = result.insertedId.toString();
                return true;
            } catch (error) {
                console.error('Error in signIn callback:', error);
                return false;
            }
        },
        async jwt({ token, user, trigger }) {
            if (user && trigger === 'signIn') {
                token.id = user.id;
                token.email = user.email || undefined;
                token.name = user.name || '';
                token.createdAt = new Date();

                if (!process.env.JWT_SECRET) {
                    throw new Error('JWT_SECRET is not defined');
                }
                const secret = new TextEncoder().encode(process.env.JWT_SECRET);
                const jwt = await new SignJWT({
                    userId: user.id,
                    email: user.email,
                })
                    .setProtectedHeader({ alg: 'HS256' })
                    .setExpirationTime('7d')
                    .sign(secret);

                token.token = jwt;
                newToken = token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id) {
                session.user = {
                    id: token.id,
                    email: token.email,
                    name: token.name,
                    createdAt: token.createdAt,
                };
                session.token = token.token;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.includes('/api/auth/callback') || url.includes('/api/auth/signin')) {
                return `${baseUrl}/dashboard`;
            }
            if (url.includes('/api/auth/signout')) {
                return `${baseUrl}/auth`; // ✅ send user to auth after logout
            }
            return url;
        },

    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth',
        error: '/auth',
    },
    session: {
        strategy: 'jwt',
    },
    debug: true,
};

// Create NextAuth handler
const authHandler = NextAuth(authOptions);

export async function GET(request: NextRequest, ctx: any) {
    if (request.nextUrl.pathname === '/api/auth/session') {
        return authHandler(request, ctx);
    }

    const response = await authHandler(request, ctx);

    // only set cookie on callback (after successful login)
    if (
        request.nextUrl.pathname.startsWith('/api/auth/callback') &&
        newToken?.token
    ) {
        const res = NextResponse.redirect(new URL('/dashboard', request.url));
        res.cookies.set('token', newToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });
        newToken = null; // clear after use ✅
        return res;
    }

    return response;
}


export async function POST(request: NextRequest, ctx: any) {
    return authHandler(request, ctx);
}
