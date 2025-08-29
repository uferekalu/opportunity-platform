import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'No token provided' },
                { status: 401 }
            );
        }

        // Edge-compatible JWT verification
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload: decoded } = await jwtVerify(token, secret);

        // Fetch user from MongoDB
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId as string) });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Verify token error:', error);
        return NextResponse.json(
            { success: false, error: 'Invalid token' },
            { status: 401 }
        );
    }
}