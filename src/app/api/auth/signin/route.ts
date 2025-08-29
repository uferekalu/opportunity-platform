import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Edge-compatible JWT signing
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const token = await new SignJWT({ userId: user._id.toString(), email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        const response = NextResponse.json({
            success: true,
            message: 'Sign-in successful',
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Sign-in error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}