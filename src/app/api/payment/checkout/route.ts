import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '@/types';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Use the latest API version
}) : null;

const checkoutSchema = z.object({
  planId: z.string(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  customerEmail: z.string().email().optional(),
  metadata: z.record(z.string()).optional()
});

// Mock payment plans (replace with database in production)
const paymentPlans = {
  'basic-monthly': {
    id: 'basic-monthly',
    name: 'Basic Plan',
    description: 'Access to basic opportunities',
    price: 9.99,
    currency: 'USD',
    interval: 'month' as const,
    stripePriceId: 'price_basic_monthly', // Replace with actual Stripe price ID
    features: [
      'Access to basic opportunities',
      'Email notifications',
      'Basic filters',
      '24/7 support'
    ]
  },
  'pro-monthly': {
    id: 'pro-monthly',
    name: 'Pro Plan',
    description: 'Access to premium opportunities and features',
    price: 19.99,
    currency: 'USD',
    interval: 'month' as const,
    stripePriceId: 'price_pro_monthly',
    features: [
      'Everything in Basic',
      'Premium opportunities',
      'Advanced filters',
      'Priority support',
      'Analytics dashboard',
      'API access'
    ]
  },
  'enterprise-monthly': {
    id: 'enterprise-monthly',
    name: 'Enterprise Plan',
    description: 'Full access with advanced features',
    price: 49.99,
    currency: 'USD',
    interval: 'month' as const,
    stripePriceId: 'price_enterprise_monthly',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'White-label options',
      'Dedicated support',
      'Custom reporting',
      'Team management'
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables.'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);
    
    const plan = paymentPlans[validatedData.planId as keyof typeof paymentPlans];
    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid plan ID'
        },
        { status: 400 }
      );
    }

    // Get the origin from the request for dynamic URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: validatedData.successUrl || `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: validatedData.cancelUrl || `${origin}/payment/cancelled`,
      customer_email: validatedData.customerEmail,
      metadata: {
        planId: plan.id,
        ...validatedData.metadata
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
          ...validatedData.metadata
        }
      },
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    const response: ApiResponse<{ checkoutUrl: string; sessionId: string }> = {
      success: true,
      data: {
        checkoutUrl: session.url!,
        sessionId: session.id
      },
      message: 'Checkout session created successfully'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Payment checkout error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid checkout data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          error: `Stripe error: ${error.message}`
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Payment processing failed'
      },
      { status: 500 }
    );
  }
}

// Get payment plans
export async function GET() {
  return NextResponse.json({
    success: true,
    data: Object.values(paymentPlans)
  });
}
