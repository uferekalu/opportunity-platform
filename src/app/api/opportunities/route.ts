import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Opportunity, PaginatedResponse, ApiResponse } from '@/types';
import { generateId } from '@/utils';

// Mock opportunities data (replace with database in production)
const mockOpportunities: Opportunity[] = [
  {
    id: generateId(),
    title: 'Senior Full Stack Developer',
    description: 'Join our innovative team to build cutting-edge web applications using React, Node.js, and modern cloud technologies. We are looking for an experienced developer who is passionate about creating exceptional user experiences.',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'job',
    category: 'Technology',
    tags: ['React', 'Node.js', 'TypeScript', 'AWS', 'GraphQL'],
    url: 'https://techcorp.com/careers/senior-fullstack-dev',
    salary: {
      min: 120000,
      max: 180000,
      currency: 'USD'
    },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(),
    source: 'manual',
    isActive: true,
    isFeatured: true
  },
  {
    id: generateId(),
    title: 'UX/UI Designer Internship',
    description: 'Learn and grow with our design team while working on real projects that impact thousands of users. Perfect opportunity for students or recent graduates to gain hands-on experience in user experience design.',
    company: 'Design Studio',
    location: 'Remote',
    type: 'internship',
    category: 'Design',
    tags: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    url: 'https://designstudio.com/internships',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(),
    source: 'manual',
    isActive: true,
    isFeatured: false
  },
  {
    id: generateId(),
    title: 'Freelance Content Writer',
    description: 'We need a skilled content writer to create engaging blog posts, articles, and marketing copy for our growing SaaS platform. Experience in B2B technology writing preferred.',
    company: 'SaaS Startup',
    location: 'Remote',
    type: 'freelance',
    category: 'Marketing',
    tags: ['Content Writing', 'SEO', 'B2B', 'SaaS', 'Copywriting'],
    salary: {
      min: 50,
      max: 100,
      currency: 'USD'
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(),
    source: 'manual',
    isActive: true,
    isFeatured: false
  },
  {
    id: generateId(),
    title: 'Data Analyst Contract Position',
    description: '6-month contract position to analyze customer data, create reports, and provide insights that drive business decisions. SQL, Python, and visualization tools experience required.',
    company: 'Analytics Pro',
    location: 'New York, NY',
    type: 'contract',
    category: 'Data',
    tags: ['SQL', 'Python', 'Tableau', 'Data Analysis', 'Statistics'],
    salary: {
      min: 80000,
      max: 95000,
      currency: 'USD'
    },
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(),
    source: 'manual',
    isActive: true,
    isFeatured: true
  },
  {
    id: generateId(),
    title: 'Product Manager',
    description: 'Lead product strategy and development for our mobile app used by millions of users worldwide. Work closely with engineering, design, and business teams to deliver exceptional products.',
    company: 'Mobile First',
    location: 'London, UK',
    type: 'job',
    category: 'Product',
    tags: ['Product Management', 'Mobile', 'Strategy', 'Agile', 'User Research'],
    salary: {
      min: 70000,
      max: 90000,
      currency: 'GBP'
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    updatedAt: new Date(),
    source: 'manual',
    isActive: true,
    isFeatured: false
  }
];

// Add more mock data
for (let i = 0; i < 15; i++) {
  const types: Opportunity['type'][] = ['job', 'internship', 'freelance', 'contract'];
  const categories = ['Technology', 'Design', 'Marketing', 'Data', 'Product', 'Sales', 'Finance'];
  const locations = ['Remote', 'San Francisco', 'New York', 'London', 'Berlin', 'Toronto'];
  
  mockOpportunities.push({
    id: generateId(),
    title: `${categories[Math.floor(Math.random() * categories.length)]} ${types[Math.floor(Math.random() * types.length)]} ${i + 1}`,
    description: `Exciting opportunity in ${categories[Math.floor(Math.random() * categories.length)].toLowerCase()} field. Join our team and make a difference!`,
    company: `Company ${i + 1}`,
    location: locations[Math.floor(Math.random() * locations.length)],
    type: types[Math.floor(Math.random() * types.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    tags: ['Technology', 'Innovation', 'Growth'].slice(0, Math.floor(Math.random() * 3) + 1),
    salary: Math.random() > 0.5 ? {
      min: Math.floor(Math.random() * 100000) + 50000,
      max: Math.floor(Math.random() * 50000) + 100000,
      currency: 'USD'
    } : undefined,
    deadline: Math.random() > 0.7 ? new Date(Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000) : undefined,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    source: 'manual',
    isActive: true,
    isFeatured: Math.random() > 0.8
  });
}

const querySchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(10),
  category: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(url.searchParams));
    
    let filteredOpportunities = [...mockOpportunities];
    
    // Apply filters
    if (query.category) {
      filteredOpportunities = filteredOpportunities.filter(
        opp => opp.category.toLowerCase() === query.category?.toLowerCase()
      );
    }
    
    if (query.type) {
      filteredOpportunities = filteredOpportunities.filter(
        opp => opp.type === query.type
      );
    }
    
    if (query.location) {
      filteredOpportunities = filteredOpportunities.filter(
        opp => opp.location?.toLowerCase().includes(query.location?.toLowerCase() || '')
      );
    }
    
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredOpportunities = filteredOpportunities.filter(
        opp => 
          opp.title.toLowerCase().includes(searchTerm) ||
          opp.description.toLowerCase().includes(searchTerm) ||
          opp.company?.toLowerCase().includes(searchTerm) ||
          opp.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort by created date (newest first), then by featured status
    filteredOpportunities.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Pagination
    const total = filteredOpportunities.length;
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const items = filteredOpportunities.slice(startIndex, endIndex);
    
    const paginatedResponse: PaginatedResponse<Opportunity> = {
      items,
      total,
      page: query.page,
      limit: query.limit,
      hasNext: endIndex < total,
      hasPrev: query.page > 1
    };
    
    const response: ApiResponse<PaginatedResponse<Opportunity>> = {
      success: true,
      data: paginatedResponse
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Opportunities API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.issues
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create opportunity schema
    const createOpportunitySchema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      company: z.string().optional(),
      location: z.string().optional(),
      type: z.enum(['job', 'internship', 'freelance', 'contract']),
      category: z.string(),
      tags: z.array(z.string()).default([]),
      url: z.string().url().optional(),
      salary: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        currency: z.string()
      }).optional(),
      deadline: z.string().transform(str => new Date(str)).optional()
    });
    
    const validatedData = createOpportunitySchema.parse(body);
    
    const newOpportunity: Opportunity = {
      id: generateId(),
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'manual',
      isActive: true,
      isFeatured: false
    };
    
    mockOpportunities.unshift(newOpportunity);
    
    return NextResponse.json({
      success: true,
      data: newOpportunity,
      message: 'Opportunity created successfully'
    });
    
  } catch (error) {
    console.error('Create opportunity error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid opportunity data',
          details: error.issues
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
