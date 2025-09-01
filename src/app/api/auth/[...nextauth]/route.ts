// app/api/auth/[...nextauth]/route.ts
import { connectToDatabase } from '@/lib/mongodb';
import NextAuth, {
    Account,
    NextAuthOptions,
    Profile,
    User,
} from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile }) {
            const db = await connectToDatabase();
            const usersCollection = db.collection('users');
            const existingUser = await usersCollection.findOne({ email: user.email });

            if (existingUser) {
                if (existingUser.password) {
                    return false; // Deny sign-in if user has a password
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
        },
        async jwt({ token, user, trigger }: { token: JWT; user: User | null; trigger?: string }) {
            console.log('JWT callback triggered:', { token, user, trigger });
            if (user && trigger === 'signIn') {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name || '';
                token.createdAt = new Date();
            }
            console.log('JWT token before return:', token);
            return token;
        },
        async session({ session, token }: { session: any; token: JWT }) {
            console.log('Session callback triggered:', { session, token });
            if (token.id) {
                session.user = {
                    id: token.id,
                    email: token.email,
                    name: token.name,
                    createdAt: token.createdAt,
                };
            }
            return session;
        },
        async redirect({ baseUrl }: { baseUrl: string }) {
            return baseUrl + '/dashboard';
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };