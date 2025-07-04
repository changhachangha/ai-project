// app/(main)/encoding/layout.tsx

'use client';

import { allTools } from '@/app/data/integrations';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export default function EncodingToolLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const currentTool = useMemo(() => {
        const toolId = pathname.split('/').pop();
        return allTools.find((tool) => tool.id === toolId);
    }, [pathname]);

    const Icon = currentTool?.icon;

    return (
        <div className='container mx-auto px-4 py-8'>
            {currentTool && Icon && (
                <div className='flex items-center gap-3 mb-8'>
                    <div
                        className='w-12 h-12 rounded-full flex items-center justify-center'
                        style={{ backgroundColor: `${currentTool.color}20` }}
                    >
                        <Icon className='w-6 h-6' style={{ color: currentTool.color }} />
                    </div>
                    <h1 className='text-3xl font-bold'>{currentTool.name}</h1>
                </div>
            )}

            {children}
        </div>
    );
}
