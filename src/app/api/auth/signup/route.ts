import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User already exists' },
                { status: 400 }
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
        };

        const result = await usersCollection.insertOne(user);

        // Edge-compatible JWT signing
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const token = await new SignJWT({ userId: result.insertedId.toString(), email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        const response = NextResponse.json({
            success: true,
            message: 'User created successfully',
            user: {
                id: result.insertedId.toString(),
                email,
                name,
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
        console.error('Sign-up error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}