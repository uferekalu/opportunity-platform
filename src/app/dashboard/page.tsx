'use client';

import React, { useEffect } from 'react';
import { OpportunityDashboard } from '@/components/dashboard/opportunity-dashboard';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { state } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!state.isAuthenticated) {
      router.replace('/auth')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OpportunityDashboard />
      </div>
    </div>
  );
}
