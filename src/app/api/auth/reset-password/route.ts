import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { success: false, error: 'Token and new password are required' },
                { status: 400 }
            );
        }

        // Verify token
        let decoded;
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
            const { payload } = await jwtVerify(token, secret, {
                algorithms: ['HS256'],
            });
            decoded = payload;
        } catch (error) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Ensure decoded contains userId and it's a string
        if (!decoded || typeof decoded !== 'object' || !('userId' in decoded) || typeof decoded.userId !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Invalid token payload' },
                { status: 401 }
            );
        }

        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Convert userId string to ObjectId
        const userId = new ObjectId(decoded.userId);

        const result = await usersCollection.updateOne(
            { _id: userId },
            { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Password reset successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}