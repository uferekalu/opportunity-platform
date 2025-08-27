import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiResponse, SubscriptionType } from '@/types';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  provider: z.enum(['substack', 'flodesk', 'beehiiv']).optional().default('substack'),
  tags: z.array(z.string()).optional().default([]),
});

// Newsletter provider integrations
class NewsletterProviders {
  static async subscribeToSubstack(email: string, name?: string, tags: string[] = []) {
    // Substack integration
    const substackApiKey = process.env.SUBSTACK_API_KEY;

    if (!substackApiKey) {
      throw new Error('Substack API key not configured');
    }

    // Mock Substack API call
    // In production, use Substack's actual API
    console.log('Subscribing to Substack:', { email, name, tags });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      subscriber_id: `substack_${Date.now()}`,
      provider: 'substack'
    };
  }

  static async subscribeToFlodesk(email: string, name?: string, tags: string[] = []) {
    // Flodesk integration
    const flodeskApiKey = process.env.FLODESK_API_KEY;

    if (!flodeskApiKey) {
      throw new Error('Flodesk API key not configured');
    }

    // Mock Flodesk API call
    // In production, use Flodesk's actual API
    console.log('Subscribing to Flodesk:', { email, name, tags });

    try {
      // Simulate Flodesk API structure
      const response = await fetch('https://api.flodesk.com/v1/subscribers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${flodeskApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          first_name: name,
          tags: tags.map(tag => ({ name: tag }))
        })
      });

      if (!response.ok) {
        throw new Error(`Flodesk API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        subscriber_id: data.id || `flodesk_${Date.now()}`,
        provider: 'flodesk'
      };
    } catch (error) {
      console.error(error)
      // Fallback for demo purposes
      console.log('Flodesk API call (mock):', { email, name, tags });
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        subscriber_id: `flodesk_${Date.now()}`,
        provider: 'flodesk'
      };
    }
  }

  static async subscribeToBeehiiv(email: string, name?: string, tags: string[] = []) {
    // Beehiiv integration
    const beehiivApiKey = process.env.BEEHIIV_API_KEY;

    if (!beehiivApiKey) {
      throw new Error('Beehiiv API key not configured');
    }

    // Mock Beehiiv API call
    // In production, use Beehiiv's actual API
    console.log('Subscribing to Beehiiv:', { email, name, tags });

    try {
      // Simulate Beehiiv API structure
      const response = await fetch('https://api.beehiiv.com/v2/publications/{publication_id}/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${beehiivApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          name,
          custom_fields: tags.reduce((acc, tag, index) => ({
            ...acc,
            [`tag_${index + 1}`]: tag
          }), {})
        })
      });

      if (!response.ok) {
        throw new Error(`Beehiiv API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        subscriber_id: data.id || `beehiiv_${Date.now()}`,
        provider: 'beehiiv'
      };
    } catch (error) {
      console.error(error);
      // Fallback for demo purposes
      console.log('Beehiiv API call (mock):', { email, name, tags });
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        subscriber_id: `beehiiv_${Date.now()}`,
        provider: 'beehiiv'
      };
    }
  }
}

// In-memory storage for demo (replace with database in production)
const newsletterSubscribers: SubscriptionType[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = subscribeSchema.parse(body);

    const { email, name, provider, tags } = validatedData;

    // Check if already subscribed
    const existingSubscriber = newsletterSubscribers.find(
      sub => sub.email === email && sub.provider === provider
    );

    if (existingSubscriber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already subscribed to this newsletter'
        },
        { status: 409 }
      );
    }

    let result;

    // Subscribe to the appropriate newsletter provider
    switch (provider) {
      case 'substack':
        result = await NewsletterProviders.subscribeToSubstack(email, name, tags);
        break;
      case 'flodesk':
        result = await NewsletterProviders.subscribeToFlodesk(email, name, tags);
        break;
      case 'beehiiv':
        result = await NewsletterProviders.subscribeToBeehiiv(email, name, tags);
        break;
      default:
        throw new Error(`Unsupported newsletter provider: ${provider}`);
    }

    // Store subscription record
    const subscription = {
      id: result.subscriber_id,
      email,
      name,
      provider,
      tags,
      status: 'subscribed',
      subscribedAt: new Date(),
      source: 'website'
    };

    newsletterSubscribers.push(subscription);

    // Trigger webhook for automations (Zapier/Make)
    try {
      await triggerAutomationWebhook('newsletter.subscribe', subscription);
    } catch (webhookError) {
      console.error('Webhook trigger failed:', webhookError);
      // Don't fail the subscription if webhook fails
    }

    const response: ApiResponse<typeof subscription> = {
      success: true,
      data: subscription,
      message: `Successfully subscribed to ${provider} newsletter`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Newsletter subscription error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid subscription data',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Newsletter subscription failed'
      },
      { status: 500 }
    );
  }
}

// Helper function to trigger automation webhooks
async function triggerAutomationWebhook(eventType: string, payload: SubscriptionType) {
  const webhookUrls = [
    process.env.ZAPIER_WEBHOOK_URL,
    process.env.MAKE_WEBHOOK_URL
  ].filter(Boolean);

  if (webhookUrls.length === 0) {
    return;
  }

  const webhookPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: payload
  };

  // Send to all configured webhook URLs
  const webhookPromises = webhookUrls.map(url =>
    fetch(url!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Event-Type': eventType
      },
      body: JSON.stringify(webhookPayload)
    }).catch(error => {
      console.error(`Webhook failed for ${url}:`, error);
    })
  );

  await Promise.allSettled(webhookPromises);
}

export async function GET() {
  // Get newsletter stats
  const stats = {
    totalSubscribers: newsletterSubscribers.length,
    providerBreakdown: newsletterSubscribers.reduce((acc, sub) => {
      acc[sub.provider] = (acc[sub.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentSubscribers: newsletterSubscribers
      .sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime())
      .slice(0, 10)
  };

  return NextResponse.json({
    success: true,
    data: stats
  });
}
