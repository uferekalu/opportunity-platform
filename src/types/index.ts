// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  isPaid?: boolean;
  subscriptionStatus?: 'active' | 'inactive' | 'trialing' | 'past_due';
}

// Waitlist Types
export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  referralSource?: string;
  createdAt: Date;
  position?: number;
}

export interface WaitlistFormData {
  email: string;
  name?: string;
  referralSource?: string;
}

// Opportunity Types
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  company?: string;
  location?: string;
  type: 'job' | 'internship' | 'freelance' | 'contract';
  category: string;
  tags: string[];
  url?: string;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  source: 'notion' | 'airtable' | 'manual';
  isActive: boolean;
  isFeatured?: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalOpportunities: number;
  newOpportunities: number;
  featuredOpportunities: number;
  categoriesCount: number;
}

export interface DashboardFilters {
  category?: string;
  type?: string;
  location?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Newsletter Types
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'subscribed' | 'unsubscribed' | 'pending';
  source: 'substack' | 'flodesk' | 'beehiiv' | 'manual';
  createdAt: Date;
  tags?: string[];
}

export interface NewsletterIntegration {
  provider: 'substack' | 'flodesk' | 'beehiiv';
  apiKey: string;
  listId?: string;
  isActive: boolean;
}

// Payment Types
export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  stripePriceId?: string;
  lemonSqueezyPriceId?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  provider: 'stripe' | 'lemonsqueezy';
  externalId: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form Types
export interface FormState {
  isLoading: boolean;
  error?: string;
  success?: boolean;
}

// Automation Types
export interface WebhookEvent {
  id: string;
  type: 'waitlist.signup' | 'newsletter.subscribe' | 'payment.success' | 'opportunity.created';
  payload: Record<string, any>;
  createdAt: Date;
  processed: boolean;
}

export interface AutomationTrigger {
  id: string;
  name: string;
  eventType: WebhookEvent['type'];
  isActive: boolean;
  zapierWebhookUrl?: string;
  makeWebhookUrl?: string;
  customEndpoint?: string;
}

// Notification Types
export interface NotificationConfig {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

// External Integration Types
export interface NotionIntegration {
  accessToken: string;
  databaseId: string;
  isActive: boolean;
}

export interface AirtableIntegration {
  apiKey: string;
  baseId: string;
  tableId: string;
  isActive: boolean;
}

// Environment Variables (for type safety)
export interface EnvConfig {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  LEMONSQUEEZY_API_KEY?: string;
  NOTION_ACCESS_TOKEN?: string;
  AIRTABLE_API_KEY?: string;
  SUBSTACK_API_KEY?: string;
  FLODESK_API_KEY?: string;
  BEEHIIV_API_KEY?: string;
  DATABASE_URL?: string;
  NEXTAUTH_SECRET?: string;
  ZAPIER_WEBHOOK_SECRET?: string;
  MAKE_WEBHOOK_SECRET?: string;
}
