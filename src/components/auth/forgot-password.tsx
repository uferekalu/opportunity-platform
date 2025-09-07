'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import axios from 'axios';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/auth/forgot-password', {
                email: data.email,
            });

            if (response.data.success) {
                toast.success('If the email exists, a reset link has been sent');
                reset();
                onBack();
            } else {
                toast.error(response.data.error || 'An error occurred. Please try again.');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center min-h-screen"
            >
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative shadow-xl"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Reset Your Password
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onBack}
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                Back
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}