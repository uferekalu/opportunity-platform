'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useResetPassword } from '@/hooks';

const resetPasswordSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const { actions } = useApp();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const resetPasswordMutation = useResetPassword();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            const errorMessage = 'Invalid or missing reset token';
            toast.error(errorMessage);
            actions.setError(errorMessage);
            return;
        }

        await resetPasswordMutation.mutateAsync({ token, password: data.password }, {
            onSuccess: () => {
                reset();
                router.push('/auth');
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center min-h-screen"
        >
            <motion.div
                initial={{ scale: 0.7, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Reset Password
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            New Password
                        </label>
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
                                    display: 'block',
                                    position: 'absolute',
                                    right: '5px',
                                    top: '9px',
                                    cursor: 'pointer',
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
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                placeholder="••••••••"
                                className={cn('mt-1', errors.confirmPassword && 'border-red-500')}
                                disabled={isSubmitting}
                            />
                            <button
                                style={{
                                    display: 'block',
                                    position: 'absolute',
                                    right: '5px',
                                    top: '9px',
                                    cursor: 'pointer',
                                }}
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !token}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        {isSubmitting ? 'Processing...' : 'Reset Password'}
                    </Button>
                </form>
            </motion.div>
        </motion.div>
    );
}