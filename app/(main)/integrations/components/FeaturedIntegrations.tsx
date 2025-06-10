'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { Integration } from '../../../data/types';

type FeaturedIntegrationsProps = {
  integrations: Integration[];
  onSelect: (integration: Integration) => void;
};

export default function FeaturedIntegrations({
  integrations,
  onSelect,
}: FeaturedIntegrationsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainerRef.current.scrollLeft;

      scrollContainerRef.current.scrollTo({
        left:
          direction === 'left'
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      <h2 className="text-lg font-semibold mb-4">Featured Integrations</h2>

      <div className="absolute top-0 right-0 flex space-x-2">
        <Button variant="outline" size="icon" onClick={() => scroll('left')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => scroll('right')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {integrations.slice(0, 10).map((integration) => (
          <div
            key={integration.id}
            className="flex-shrink-0 w-[250px] bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => onSelect(integration)}>
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${integration.color}20` }}>
                {integration.icon && (
                  <integration.icon 
                    className="w-5 h-5"
                    style={{ color: integration.color }}
                  />
                )}
              </div>
              <h3 className="font-medium">{integration.name}</h3>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {integration.description}
            </p>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {integration.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
