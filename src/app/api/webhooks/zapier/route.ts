import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { ApiResponse, NewsletterSubscriber, Opportunity, Subscription, WaitlistFormData } from '@/types';

// Webhook event schema
const webhookEventSchema = z.object({
  event: z.string(),
  timestamp: z.string(),
  data: z.any()
});

// Verify webhook signature (for security)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  const receivedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}

// Handle incoming webhook from Zapier
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-zapier-signature') || '';
    const webhookSecret = process.env.ZAPIER_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && !verifyWebhookSignature(payload, signature, webhookSecret)) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const body = JSON.parse(payload);
    const validatedData = webhookEventSchema.parse(body);

    console.log('Zapier webhook received:', validatedData);

    // Process different event types
    switch (validatedData.event) {
      case 'waitlist.signup':
        await handleWaitlistSignup(validatedData.data);
        break;
      case 'newsletter.subscribe':
        await handleNewsletterSubscribe(validatedData.data);
        break;
      case 'opportunity.created':
        await handleOpportunityCreated(validatedData.data);
        break;
      case 'payment.success':
        await handlePaymentSuccess(validatedData.data);
        break;
      default:
        console.log(`Unhandled event type: ${validatedData.event}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      eventType: validatedData.event
    });

  } catch (error) {
    console.error('Zapier webhook error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid webhook payload',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed'
      },
      { status: 500 }
    );
  }
}

// Event handlers
async function handleWaitlistSignup(data: WaitlistFormData) {
  console.log('Processing waitlist signup:', data);
  
  // Example automations:
  // - Send welcome email
  // - Add to CRM
  // - Update spreadsheet
  // - Notify team on Slack
  
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // You could integrate with external services here:
  // - Mailchimp/ConvertKit for email marketing
  // - HubSpot/Salesforce for CRM
  // - Slack for notifications
  // - Google Sheets for tracking
}

async function handleNewsletterSubscribe(data: NewsletterSubscriber) {
  console.log('Processing newsletter subscription:', data);
  
  // Example automations:
  // - Send confirmation email
  // - Add to mailing list segments
  // - Update user profile
  // - Track conversion metrics
  
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function handleOpportunityCreated(data: Opportunity) {
  console.log('Processing opportunity created:', data);
  
  // Example automations:
  // - Notify matching users
  // - Post to social media
  // - Update job boards
  // - Send to recruitment platforms
  
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function handlePaymentSuccess(data: Subscription) {
  console.log('Processing payment success:', data);
  
  // Example automations:
  // - Send receipt
  // - Update user permissions
  // - Add to premium segments
  // - Notify accounting system
  
  await new Promise(resolve => setTimeout(resolve, 100));
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const challenge = url.searchParams.get('challenge');
  
  if (challenge) {
    // Zapier webhook verification
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({
    success: true,
    message: 'Zapier webhook endpoint is active',
    supportedEvents: [
      'waitlist.signup',
      'newsletter.subscribe',
      'opportunity.created',
      'payment.success'
    ]
  });
}
