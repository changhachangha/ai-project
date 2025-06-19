'use client';

import dynamic from 'next/dynamic';

const ClientBase32Tool = dynamic(() => import('./ClientBase32Tool'), { ssr: false });

export default function Base32Page() {
    return <ClientBase32Tool />;
}
