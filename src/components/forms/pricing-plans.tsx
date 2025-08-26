'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils';
import toast from 'react-hot-toast';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  isPopular?: boolean;
  icon?: React.ReactNode;
}

interface PricingPlansProps {
  plans?: PricingPlan[];
  className?: string;
  onSelectPlan?: (planId: string) => void;
}

const defaultPlans: PricingPlan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic',
    description: 'Perfect for individuals starting their career journey',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    stripePriceId: 'price_basic_monthly',
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Access to basic opportunities',
      'Email notifications',
      'Basic filters and search',
      '24/7 community support',
      'Mobile app access'
    ]
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    description: 'Ideal for professionals seeking premium opportunities',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    stripePriceId: 'price_pro_monthly',
    icon: <Star className="w-6 h-6" />,
    isPopular: true,
    features: [
      'Everything in Basic',
      'Premium opportunities',
      'Advanced filters & AI matching',
      'Priority support',
      'Analytics dashboard',
      'API access',
      'Custom job alerts',
      'Resume optimization tips'
    ]
  },
  {
    id: 'enterprise-monthly',
    name: 'Enterprise',
    description: 'Complete solution for teams and organizations',
    price: 49.99,
    currency: 'USD',
    interval: 'month',
    stripePriceId: 'price_enterprise_monthly',
    icon: <Crown className="w-6 h-6" />,
    features: [
      'Everything in Pro',
      'Team management (up to 10 users)',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager',
      'Custom reporting',
      'Priority placement',
      'Advanced analytics',
      'Custom onboarding'
    ]
  }
];

export const PricingPlans: React.FC<PricingPlansProps> = ({
  plans = defaultPlans,
  className,
  onSelectPlan
}) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
      return;
    }

    try {
      setLoadingPlan(planId);
      
      // Call checkout API
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to Stripe checkout
        window.location.href = data.data.checkoutUrl;
      } else {
        toast.error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className={className}>
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Unlock exclusive opportunities and advanced features with our flexible pricing options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
          >
            <Card className={`h-full flex flex-col ${
              plan.isPopular 
                ? 'border-blue-500 shadow-xl scale-105 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900' 
                : 'border-gray-200 shadow-sm hover:shadow-lg transition-shadow'
            }`}>
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="bg-blue-500 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  plan.isPopular ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {plan.icon}
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </CardTitle>
                
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {plan.description}
                </p>
                
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 ml-1">
                    /{plan.interval}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    variant={plan.isPopular ? "default" : "outline"}
                    size="lg"
                    className="w-full"
                    loading={loadingPlan === plan.id}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === plan.id ? 'Creating checkout...' : `Choose ${plan.name}`}
                  </Button>
                </div>

                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cancel anytime • 7-day free trial
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Need a custom solution for your organization?
        </p>
        <Button variant="outline" size="lg">
          Contact Sales
        </Button>
      </div>

      <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            All plans include:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center justify-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              SSL Security & Encryption
            </div>
            <div className="flex items-center justify-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              GDPR Compliant
            </div>
            <div className="flex items-center justify-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              99.9% Uptime Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
