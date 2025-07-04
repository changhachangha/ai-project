'use client';

import dynamic from 'next/dynamic';

const NumberConverterClient = dynamic(() => import('./NumberConverterClient'), { ssr: false });

export default function NumberConverterPage() {
    return <NumberConverterClient />;
}
