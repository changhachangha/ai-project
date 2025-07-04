'use client';

import dynamic from 'next/dynamic';

const MarkdownTableGeneratorClient = dynamic(() => import('./MarkdownTableGeneratorClient'), {
    ssr: false,
});

export default function MarkdownTableGeneratorPage() {
    return <MarkdownTableGeneratorClient />;
}
