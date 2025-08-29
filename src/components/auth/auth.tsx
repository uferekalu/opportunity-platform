'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import axios from 'axios';

// Zod schema for form validation
const signInSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const signUpSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
        email: z.string().email('Please enter a valid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { state, actions } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (state.isAuthenticated) {
            router.replace('/dashboard')
        }
    }, [state.isAuthenticated, router])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<SignInFormData | SignUpFormData>({
        resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    });

    const handleSwitchMode = () => {
        setIsSignUp(!isSignUp);
        reset();
    };

    const handleGoogleSignIn = () => {
        toast.success('Google sign-in coming soon!');
        // Placeholder for Google OAuth implementation
    };

    const onSubmit = async (data: SignInFormData | SignUpFormData) => {
        try {
            const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
            const payload = isSignUp
                ? { name: (data as SignUpFormData).name, email: data.email, password: data.password }
                : { email: data.email, password: data.password };

            const response = await axios.post(endpoint, payload);

            if (response.data.success) {
                actions.setUser(response.data.user);
                actions.setAuthenticated(true);
                toast.success(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
                reset();
                router.push('/dashboard');
            } else {
                toast.error(response.data.error || 'An error occurred. Please try again.');
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.status === 429
                    ? 'Too many sign-up attempts. Please try again later.'
                    : error.response?.data?.error || 'An error occurred. Please try again.';
            toast.error(errorMessage);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center"
            >
                <motion.div
                    initial={{ scale: 0.7, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.7, opacity: 0, y: 50 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative shadow-xl"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label htmlFor="name">Full Name</label>
                                <Input
                                    id="name"
                                    type="text"
                                    {...register('name')}
                                    placeholder="John Doe"
                                    className={cn(
                                        'mt-1',
                                        isSignUp && 'name' in errors && errors.name && 'border-red-500'
                                    )}
                                    disabled={isSubmitting}
                                />
                                {isSignUp && 'name' in errors && errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email">Email</label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="you@example.com"
                                className={cn('mt-1', errors.email && 'border-red-500')}
                                disabled={isSubmitting}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    placeholder="••••••••"
                                    className={cn('mt-1', errors.password && 'border-red-500')}
                                    disabled={isSubmitting}
                                />
                                <button
                                    style={{
                                        display: "block",
                                        position: "absolute",
                                        right: "5px",
                                        top: "9px",
                                        cursor: "pointer"
                                    }}
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>
                        {isSignUp && (
                            <div>
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...register('confirmPassword')}
                                        placeholder="••••••••"
                                        className={cn('mt-1', isSignUp && 'confirmPassword' in errors && errors.confirmPassword && 'border-red-500')}
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        style={{
                                            display: "block",
                                            position: "absolute",
                                            right: "5px",
                                            top: "9px",
                                            cursor: "pointer"
                                        }}
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {isSignUp && 'confirmPassword' in errors && errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        )}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            {isSubmitting ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-4 cursor-pointer">
                        <Button
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={handleGoogleSignIn}
                            disabled={isSubmitting}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285f4"
                                    d="M12.24 10.4V14h3.76c-.16 1-.66 1.94-1.38 2.66l2.22 1.7c1.44-1.34 2.26-3.24 2.26-5.36 0-.6-.06-1.18-.16-1.74H12.24z"
                                />
                                <path
                                    fill="#34a853"
                                    d="M12 20c-2.36 0-4.5-.96-6.04-2.5l-2.22 1.7C5.66 21.5 8.66 23 12 23c2.3 0 4.44-.66 6.24-1.8l-2.22-1.7c-.98.58-2.1.9-3.24.9z"
                                />
                                <path
                                    fill="#fbbc05"
                                    d="M4.76 12c0-1.14.32-2.26.9-3.24l-2.22-1.7C2.3 8.86 1.66 10.98 1.66 13c0 2.02.64 4.14 1.8 5.86l2.22-1.7c-.58-.98-.9-2.1-.9-3.24z"
                                />
                                <path
                                    fill="#eb4335"
                                    d="M12 4c2.3 0 4.44.66 6.24 1.8l2.22-1.7C18.34 2.5 15.34 1 12 1c-2.3 0-4.44.66-6.24 1.8l2.22 1.7C9.96 4.96 11.3 5 12 5z"
                                />
                            </svg>
                            Sign in with Google
                        </Button>
                    </div>

                    <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            onClick={handleSwitchMode}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium cursor-pointer"
                            disabled={isSubmitting}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}