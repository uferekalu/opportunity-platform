'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Clock, DollarSign, Building2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Opportunity } from '@/types';
import { formatCurrency, formatRelativeTime, truncate } from '@/utils';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onApply?: (opportunity: Opportunity) => void;
  variant?: 'default' | 'compact';
}

const getTypeVariant = (type: Opportunity['type']) => {
  switch (type) {
    case 'job':
      return 'info';
    case 'internship':
      return 'warning';
    case 'freelance':
      return 'success';
    case 'contract':
      return 'secondary';
    default:
      return 'default';
  }
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onApply,
  variant = 'default'
}) => {
  const isCompact = variant === 'compact';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className={isCompact ? 'p-4 pb-2' : undefined}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className={isCompact ? 'text-lg' : 'text-xl'}>
                {truncate(opportunity.title, isCompact ? 50 : 80)}
              </CardTitle>
              {opportunity.company && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                  <Building2 className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm truncate">{opportunity.company}</span>
                </div>
              )}
            </div>
            <Badge variant={getTypeVariant(opportunity.type)} className="flex-shrink-0">
              {opportunity.type}
            </Badge>
          </div>
          
          {!isCompact && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
              {opportunity.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{opportunity.location}</span>
                </div>
              )}
              {opportunity.salary && (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>
                    {opportunity.salary.min && opportunity.salary.max
                      ? `${formatCurrency(opportunity.salary.min)} - ${formatCurrency(opportunity.salary.max)}`
                      : opportunity.salary.min
                      ? `${formatCurrency(opportunity.salary.min)}+`
                      : 'Competitive'}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatRelativeTime(opportunity.createdAt)}</span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className={isCompact ? 'p-4 pt-2' : 'flex-1'}>
          <p className={`text-gray-600 dark:text-gray-300 ${isCompact ? 'text-sm' : ''}`}>
            {truncate(opportunity.description, isCompact ? 100 : 200)}
          </p>
          
          {opportunity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {opportunity.tags.slice(0, isCompact ? 3 : 5).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {opportunity.tags.length > (isCompact ? 3 : 5) && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.tags.length - (isCompact ? 3 : 5)} more
                </Badge>
              )}
            </div>
          )}

          {opportunity.deadline && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <div className="flex items-center text-yellow-700 dark:text-yellow-300 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span>Deadline: {formatRelativeTime(opportunity.deadline)}</span>
              </div>
            </div>
          )}

          {opportunity.isFeatured && (
            <div className="mt-2">
              <Badge variant="success" className="text-xs">
                Featured
              </Badge>
            </div>
          )}
        </CardContent>

        <CardFooter className={`gap-2 ${isCompact ? 'p-4 pt-2' : ''}`}>
          <Button 
            className="flex-1" 
            size={isCompact ? 'sm' : 'default'}
            onClick={() => onApply?.(opportunity)}
          >
            Apply Now
          </Button>
          {opportunity.url && (
            <Button 
              variant="outline" 
              size={isCompact ? 'sm' : 'default'}
              onClick={() => window.open(opportunity.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};
