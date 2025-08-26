'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNewsletterSignup } from '@/hooks';
import { cn } from '@/utils';
import { Mail, Check } from 'lucide-react';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
  provider: z.enum(['substack', 'flodesk', 'beehiiv']).default('substack'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  className?: string;
  variant?: 'default' | 'inline' | 'embedded';
  provider?: 'substack' | 'flodesk' | 'beehiiv';
  showProviderSelection?: boolean;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

const providerInfo = {
  substack: {
    name: 'Substack',
    description: 'Get weekly insights delivered to your inbox',
    color: 'bg-orange-500'
  },
  flodesk: {
    name: 'Flodesk',
    description: 'Beautiful newsletters with exclusive content',
    color: 'bg-pink-500'
  },
  beehiiv: {
    name: 'Beehiiv',
    description: 'Professional updates and industry news',
    color: 'bg-purple-500'
  }
};

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  className,
  variant = 'default',
  provider: defaultProvider = 'substack',
  showProviderSelection = false,
  title,
  description,
  onSuccess
}) => {
  const newsletterMutation = useNewsletterSignup();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(defaultProvider);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      provider: defaultProvider
    }
  });

  // Show success state if already submitted
  if (isSubmitted) {
    return (
      <div className={cn(
        'bg-green-50 border border-green-200 rounded-lg p-6 text-center dark:bg-green-900/20 dark:border-green-800',
        className
      )}>
        <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-800">
          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          Successfully subscribed!
        </h3>
        <p className="text-green-700 dark:text-green-300 mb-4">
          Thank you for subscribing to our {providerInfo[selectedProvider].name} newsletter. 
          Check your email for a confirmation message.
        </p>
      </div>
    );
  }

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      const result = await newsletterMutation.mutateAsync({
        ...data,
        provider: selectedProvider
      });
      
      if (result.success) {
        setIsSubmitted(true);
        toast.success(`Successfully subscribed to ${providerInfo[selectedProvider].name}!`);
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error: any) {
      console.error('Newsletter signup error:', error);
      toast.error(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const isInline = variant === 'inline';
  const isEmbedded = variant === 'embedded';

  return (
    <div className={cn(
      'w-full',
      !isInline && !isEmbedded && 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm',
      isEmbedded && 'bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4',
      className
    )}>
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <Mail className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className={cn(
            'font-bold text-gray-900 dark:text-white',
            isInline || isEmbedded ? 'text-lg' : 'text-2xl'
          )}>
            {title || 'Subscribe to Newsletter'}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {description || 'Get the latest opportunities and insights delivered to your inbox.'}
        </p>
        
        {showProviderSelection && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {(Object.keys(providerInfo) as Array<keyof typeof providerInfo>).map(provider => (
              <Badge
                key={provider}
                variant={selectedProvider === provider ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedProvider(provider);
                  setValue('provider', provider);
                }}
              >
                <div className={`w-2 h-2 rounded-full ${providerInfo[provider].color} mr-2`} />
                {providerInfo[provider].name}
              </Badge>
            ))}
          </div>
        )}
        
        {!showProviderSelection && (
          <div className="mt-3 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${providerInfo[selectedProvider].color} mr-2`} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Powered by {providerInfo[selectedProvider].name}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className={cn(
          isInline && 'flex gap-3 items-end'
        )}>
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
              Subscribe
            </Button>
          )}
        </div>

        {!isInline && (
          <Input
            {...register('name')}
            type="text"
            placeholder="Your name (optional)"
            label="Name"
            error={errors.name?.message}
            disabled={isSubmitting}
          />
        )}

        {!isInline && (
          <Button
            type="submit"
            loading={isSubmitting}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isSubmitting ? 'Subscribing...' : `Subscribe to ${providerInfo[selectedProvider].name}`}
          </Button>
        )}
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          We respect your privacy. Unsubscribe at any time. No spam, ever.
        </p>
      </div>
    </div>
  );
};
