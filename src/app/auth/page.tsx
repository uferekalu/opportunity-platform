import { Suspense } from 'react';
import Auth from '@/components/auth/auth';

export default function AuthPage() {
  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<div>Loading...</div>}>
            <Auth />
          </Suspense>
        </div>
      </div>
  );
}