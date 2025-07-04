'use client';

import type { Integration } from '../../../data/types';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type IntegrationCardProps = {
    integration: Integration;
    onSelect: (integration: Integration) => void;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
};

export default function IntegrationCard({ integration, onSelect, isFavorite, onToggleFavorite }: IntegrationCardProps) {
    const Icon = integration.icon;

    return (
        <Card
            className='hover:shadow-lg transition-all duration-300 group h-full cursor-pointer transform hover:-translate-y-1'
            onClick={() => onSelect(integration)}
        >
            <CardContent className='p-4 flex flex-col h-full relative'>
                <button
                    className='absolute top-2 right-2 z-10 p-1.5 rounded-full bg-transparent transition-colors hover:bg-accent'
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(integration.id);
                    }}
                >
                    <Heart
                        className={cn(
                            'h-5 w-5 transition-colors',
                            isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground group-hover:text-red-400'
                        )}
                    />
                </button>
                <div className='flex flex-col items-center text-center space-y-2 mb-2'>
                    <div
                        className='w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300'
                        style={{ backgroundColor: `${integration.color}20` }}
                    >
                        <Icon
                            className='w-6 h-6 transition-transform duration-300 group-hover:scale-110'
                            style={{ color: integration.color }}
                        />
                    </div>
                    <h3 className='font-semibold text-sm'>{integration.name}</h3>
                </div>
                <p className='text-xs text-muted-foreground flex-grow overflow-hidden'>
                    {integration.description.length > 150
                        ? `${integration.description.substring(0, 150)}...`
                        : integration.description}
                </p>
                <div className='mt-3 pt-2 border-t border-border flex justify-between items-center'>
                    <span className='text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full'>
                        {integration.category}
                    </span>
                    <span className='text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        View details →
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
