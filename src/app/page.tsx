'use client';

import React from 'react';
import HeroSection from '@/components/ui/sections/hero-section';
import StatsSection from '@/components/ui/sections/stats-section';
import FeaturedSection from '@/components/ui/sections/featured-section';
import TestimonialsSection from '@/components/ui/sections/testimonials-section';
import DashboardPreviewSection from '@/components/ui/sections/dashboard-preview-section';
import PricingPlanSection from '@/components/ui/sections/pricing-plan-section';
import NewsletterSection from '@/components/ui/sections/newsletter-section';
import CTASection from '@/components/ui/sections/cta-section';

export default function Home() {
  return (
    <>
      <div className="flex flex-col">      
        <HeroSection />        
        <StatsSection />
        <FeaturedSection />
        <TestimonialsSection />
        <DashboardPreviewSection />
        <PricingPlanSection />
        <NewsletterSection />
        <CTASection />
      </div>
    </>
  );
}