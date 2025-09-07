'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWaitlistSignup, useWaitlistStats } from '@/hooks';
import { useApp } from '@/context/app-context';
import { cn } from '@/utils';

const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
  referralSource: z.string().optional(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
  className?: string;
  variant?: 'default' | 'inline' | 'modal';
  showName?: boolean;
  showReferralSource?: boolean;
  onSuccess?: () => void;
}

export const WaitlistForm: React.FC<WaitlistFormProps> = ({
  className,
  variant = 'default',
  showName = true,
  showReferralSource = false,
  onSuccess,
}) => {
  const { state, actions } = useApp();
  const waitlistMutation = useWaitlistSignup();
  const { data: statsData } = useWaitlistStats();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  // Show success state if user already joined
  if (state.waitlistEntry || isSubmitted) {
    return (
      <div
        className={cn(
          'bg-green-50 border border-green-200 rounded-lg p-6 text-center dark:bg-green-900/20 dark:border-green-800',
          className
        )}
      >
        <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-800">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">You're on the waitlist!</h3>
        <p className="text-green-700 dark:text-green-300 mb-4">
          Thank you for joining. We'll notify you as soon as we launch.
        </p>
        {state.waitlistEntry?.position && (
          <p className="text-sm text-green-600 dark:text-green-400">
            You're #{state.waitlistEntry.position} on the list
          </p>
        )}
        {statsData?.data?.total && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            {statsData.data.total} people have joined so far
          </p>
        )}
      </div>
    );
  }

  const onSubmit = async (data: WaitlistFormData) => {
    try {
      const result = await waitlistMutation.mutateAsync(data);
      if (result.success) {
        setIsSubmitted(true);
        toast.success('Successfully joined the waitlist!');
        reset();
        actions.clearError();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to join waitlist. Please try again.');
        actions.setError(result.error || 'Failed to join waitlist');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred. Please try again.';
      toast.error(errorMessage);
      actions.setError(errorMessage);
    }
  };

  const isInline = variant === 'inline';
  const isModal = variant === 'modal';

  return (
    <div
      className={cn(
        'w-full',
        !isInline && 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm',
        isModal && 'max-w-md mx-auto',
        className
      )}
    >
      <div className="mb-6 text-center">
        <h2
          className={cn('font-bold text-gray-900 dark:text-white mb-2', isInline ? 'text-xl' : 'text-2xl')}
        >
          Join the Waitlist
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Be the first to know when we launch and get exclusive early access.
        </p>
        {statsData?.data?.total && (
          <p className="text-blue-600 dark:text-blue-400 text-sm mt-2 font-medium">
            {statsData.data.total} people already joined
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className={cn(isInline && 'flex gap-3 items-end')}>
          <div className={cn(isInline && 'flex-1')}>
            <Input
              {...register('email')}
              type="email"
              placeholder="Enter your email"
              label={!isInline ? 'Email Address' : undefined}
              error={errors.email?.message}
              disabled={isSubmitting}
              className={isInline ? 'mb-0' : ''}
            />
          </div>

          {isInline && (
            <Button
              type="submit"
              loading={isSubmitting}
              variant="primary"
              className="shrink-0"
            >
              Join Waitlist
            </Button>
          )}
        </div>

        {showName && !isInline && (
          <Input
            {...register('name')}
            type="text"
            placeholder="Your name (optional)"
            label="Name"
            error={errors.name?.message}
            disabled={isSubmitting}
          />
        )}

        {showReferralSource && !isInline && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How did you hear about us? (Optional)
            </label>
            <select
              {...register('referralSource')}
              className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="">Select an option</option>
              <option value="search">Search Engine</option>
              <option value="social">Social Media</option>
              <option value="friend">Friend/Colleague</option>
              <option value="blog">Blog/Article</option>
              <option value="newsletter">Newsletter</option>
              <option value="event">Event/Conference</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {!isInline && (
          <Button
            type="submit"
            loading={isSubmitting}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
          </Button>
        )}
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};