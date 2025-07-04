'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';
import type { Integration } from '../../../data/types';
import { cn } from '@/lib/utils';

type IntegrationModalProps = {
    integration: Integration | null;
    isOpen: boolean;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
    onLearnMore: (id: string) => void; // 추가
    onConnect: (id: string) => void; // 추가
};

export default function IntegrationModal({
    integration,
    isOpen,
    onClose,
    isFavorite,
    onToggleFavorite,
    onLearnMore,
    onConnect,
}: IntegrationModalProps) {
    if (!integration) return null;

    const Icon = integration.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div
                                className='w-10 h-10 rounded-full flex items-center justify-center'
                                style={{ backgroundColor: `${integration.color}20` }}
                            >
                                <Icon className='w-5 h-5' style={{ color: integration.color }} />
                            </div>
                            <DialogTitle>{integration.name}</DialogTitle>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(integration.id);
                                }}
                            >
                                <Heart
                                    className={cn(
                                        'h-6 w-6 transition-colors',
                                        isFavorite
                                            ? 'fill-red-500 text-red-500'
                                            : 'text-muted-foreground hover:text-red-500'
                                    )}
                                />
                            </Button>
                            <Button variant='ghost' size='icon' onClick={onClose}>
                                <X className='w-5 h-5' />
                            </Button>
                        </div>
                    </div>
                    <DialogDescription>
                        <span className='inline-block bg-secondary text-xs px-2 py-1 rounded-full mt-2'>
                            {integration.category}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 mt-4'>
                    <p className='text-sm text-muted-foreground'>{integration.description}</p>

                    <div className='space-y-2'>
                        <h4 className='text-sm font-medium'>Key Features</h4>
                        <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1'>
                            <li>Seamless integration with your existing workflow</li>
                            <li>Advanced analytics and reporting capabilities</li>
                            <li>Real-time data synchronization</li>
                            <li>Customizable dashboard and notifications</li>
                        </ul>
                    </div>

                    <div className='pt-4 flex justify-end gap-3'>
                        <Button variant='outline' onClick={() => onLearnMore(integration.id)}>
                            Learn More
                        </Button>
                        <Button onClick={() => onConnect(integration.id)}>Connect Integration</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
