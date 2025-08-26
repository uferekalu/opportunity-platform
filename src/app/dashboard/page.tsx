'use client';

import React from 'react';
import { OpportunityDashboard } from '@/components/dashboard/opportunity-dashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OpportunityDashboard />
      </div>
    </div>
  );
}
