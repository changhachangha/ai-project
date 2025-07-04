'use client';

import dynamic from 'next/dynamic';

const YamlJsonConverterClient = dynamic(() => import('./YamlJsonConverterClient'), {
    ssr: false,
    loading: () => (
        <div className='container mx-auto p-4'>
            <div className='animate-pulse'>
                <div className='h-8 bg-muted rounded w-1/3 mb-4'></div>
                <div className='h-32 bg-muted rounded mb-4'></div>
                <div className='h-10 bg-muted rounded w-24 mb-4'></div>
                <div className='h-32 bg-muted rounded'></div>
            </div>
        </div>
    ),
});

export default function YamlJsonConverterPage() {
    return <YamlJsonConverterClient />;
}
