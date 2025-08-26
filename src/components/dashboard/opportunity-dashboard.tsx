'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  TrendingUp, 
  Star, 
  Users, 
  Grid3X3, 
  List,
  ExternalLink,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OpportunityCard } from './opportunity-card';
import { DashboardFiltersComponent } from './dashboard-filters';
import { useOpportunities, useDashboardStats } from '@/hooks';
import { DashboardFilters, Opportunity } from '@/types';
import { number } from '@/utils';

interface OpportunityDashboardProps {
  className?: string;
  embedded?: boolean;
  maxHeight?: string;
}

export const OpportunityDashboard: React.FC<OpportunityDashboardProps> = ({
  className,
  embedded = false,
  maxHeight = '600px'
}) => {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useOpportunities({
    page,
    limit: 12,
    ...filters
  });

  const { data: statsData, isLoading: statsLoading } = useDashboardStats();

  const opportunities = opportunitiesData?.data?.items || [];
  const hasNextPage = opportunitiesData?.data?.hasNext || false;
  const stats = statsData?.data;

  const handleApply = (opportunity: Opportunity) => {
    // Handle application logic - could open modal, redirect, etc.
    if (opportunity.url) {
      window.open(opportunity.url, '_blank');
    } else {
      // Handle internal application flow
      console.log('Apply to:', opportunity);
    }
  };

  const loadMore = () => {
    if (hasNextPage) {
      setPage(prev => prev + 1);
    }
  };

  if (!embedded && (opportunitiesLoading || statsLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div 
      className={className}
      style={{ maxHeight: embedded ? maxHeight : undefined }}
    >
      {!embedded && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Opportunity Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Discover and apply to curated opportunities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Integrations
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{number.formatCompact(stats.totalOpportunities)}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Available positions
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New This Week</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.newOpportunities}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Fresh opportunities
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Featured</CardTitle>
                    <Star className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.featuredOpportunities}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Premium listings
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.categoriesCount}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Different fields
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </>
      )}

      {/* Filters */}
      <DashboardFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        className="mb-6"
      />

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {opportunities.length > 0 ? (
              <>Showing {opportunities.length} opportunities</>
            ) : (
              'No opportunities found'
            )}
          </span>
          {Object.keys(filters).length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Filtered
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Opportunities Grid/List */}
      <div 
        className={`
          ${embedded ? 'overflow-y-auto' : ''} 
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}
        style={{ maxHeight: embedded ? 'calc(100% - 200px)' : undefined }}
      >
        {opportunities.map((opportunity, index) => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <OpportunityCard
              opportunity={opportunity}
              onApply={handleApply}
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {opportunities.length === 0 && !opportunitiesLoading && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No opportunities found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try adjusting your filters or check back later for new opportunities.
          </p>
          <Button onClick={() => setFilters({})} variant="outline">
            Clear filters
          </Button>
        </div>
      )}

      {/* Load More Button */}
      {hasNextPage && !embedded && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={loadMore}
            variant="outline"
            disabled={opportunitiesLoading}
          >
            {opportunitiesLoading ? 'Loading...' : 'Load more opportunities'}
          </Button>
        </div>
      )}

      {/* Embedded Footer */}
      {embedded && opportunities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>{opportunities.length} opportunities shown</span>
            <Button size="sm" variant="outline">
              View all in dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
