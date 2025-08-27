import { NextResponse } from 'next/server';
import { DashboardStats, ApiResponse } from '@/types';

// Mock function to simulate fetching dashboard stats
// In production, this would query your database
const getDashboardStats = async (): Promise<DashboardStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Calculate stats based on current date
  // const now = new Date();
  // const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return {
    totalOpportunities: 247,
    newOpportunities: 23, // New opportunities in the last week
    featuredOpportunities: 12,
    categoriesCount: 8
  };
};

export async function GET() {
  try {
    const stats = await getDashboardStats();
    
    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics'
      },
      { status: 500 }
    );
  }
}
