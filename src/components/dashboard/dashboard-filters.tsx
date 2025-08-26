'use client';

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DashboardFilters as DashboardFiltersType } from '@/types';
import { useDebounce } from '@/hooks';

interface DashboardFiltersProps {
  filters: DashboardFiltersType;
  onFiltersChange: (filters: DashboardFiltersType) => void;
  className?: string;
}

const categories = [
  'Technology',
  'Design',
  'Marketing',
  'Sales',
  'Engineering',
  'Product',
  'Data',
  'Finance',
  'Operations',
  'Other'
];

const opportunityTypes = [
  'job',
  'internship',
  'freelance',
  'contract'
];

const locations = [
  'Remote',
  'New York',
  'San Francisco',
  'London',
  'Berlin',
  'Toronto',
  'Sydney',
  'Tokyo'
];

export const DashboardFiltersComponent: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    onFiltersChange({
      ...filters,
      // Add search to filters when implemented
    });
  }, [debouncedSearch]);

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: filters.category === category ? undefined : category
    });
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      type: filters.type === type ? undefined : type
    });
  };

  const handleLocationChange = (location: string) => {
    onFiltersChange({
      ...filters,
      location: filters.location === location ? undefined : location
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setSearchQuery('');
  };

  const hasActiveFilters = !!(filters.category || filters.type || filters.location || filters.tags?.length);

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search opportunities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              Category: {filters.category}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleCategoryChange(filters.category!)}
              />
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.type}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleTypeChange(filters.type!)}
              />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              Location: {filters.location}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleLocationChange(filters.location!)}
              />
            </Badge>
          )}
          {filters.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          {/* Categories */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={filters.category === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Opportunity Types */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Opportunity Type</h4>
            <div className="flex flex-wrap gap-2">
              {opportunityTypes.map(type => (
                <Badge
                  key={type}
                  variant={filters.type === type ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => handleTypeChange(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Location</h4>
            <div className="flex flex-wrap gap-2">
              {locations.map(location => (
                <Badge
                  key={location}
                  variant={filters.location === location ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleLocationChange(location)}
                >
                  {location}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
