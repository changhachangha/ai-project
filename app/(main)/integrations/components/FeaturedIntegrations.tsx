'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { Integration } from '../../../data/types';

type FeaturedIntegrationsProps = {
    integrations: Integration[];
    /** 도구 id → 추천 사유 라벨. 없으면 사유를 표시하지 않는다. */
    reasonById?: Record<string, string>;
    onSelect: (integration: Integration) => void;
};

export default function FeaturedIntegrations({
    integrations,
    reasonById,
    onSelect,
}: FeaturedIntegrationsProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const currentScroll = scrollContainerRef.current.scrollLeft;

            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className='relative'>
            <h2 className='text-lg font-semibold mb-4'>추천 도구</h2>

            <div className='absolute top-0 right-0 flex space-x-2'>
                <Button variant='outline' size='icon' aria-label='이전 항목으로 스크롤' onClick={() => scroll('left')}>
                    <ChevronLeft className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='icon' aria-label='다음 항목으로 스크롤' onClick={() => scroll('right')}>
                    <ChevronRight className='h-4 w-4' />
                </Button>
            </div>

            <div
                ref={scrollContainerRef}
                className='flex space-x-4 overflow-x-auto pb-4 scrollbar-hide'
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* 노출 개수는 호출부가 결정한다. 여기서 또 자르면 이중으로 잘려
                    추천 결과가 일부만 보이는 문제가 생긴다. */}
                {integrations.map((integration) => (
                    <div
                        key={integration.id}
                        className='flex-shrink-0 w-[250px] bg-card rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border'
                        onClick={() => onSelect(integration)}
                    >
                        <div className='flex items-center space-x-3 mb-3'>
                            <div
                                className='w-10 h-10 rounded-full flex items-center justify-center'
                                style={{ backgroundColor: `${integration.color}20` }}
                            >
                                {integration.icon && (
                                    <integration.icon className='w-5 h-5' style={{ color: integration.color }} />
                                )}
                            </div>
                            <h3 className='font-medium text-card-foreground'>{integration.name}</h3>
                        </div>
                        <p className='text-xs text-muted-foreground line-clamp-2 mb-3'>{integration.description}</p>
                        <div className='flex items-center gap-2 flex-wrap'>
                            <span className='text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full'>
                                {integration.category}
                            </span>
                            {/* 추천 사유. 개인화 신호가 없어 라운드로빈으로 채운 항목은 사유가 없다. */}
                            {reasonById?.[integration.id] && (
                                <span className='text-[11px] text-muted-foreground'>
                                    {reasonById[integration.id]}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
