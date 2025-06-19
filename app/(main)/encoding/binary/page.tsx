'use client';

import dynamic from 'next/dynamic';

const ClientBinaryTool = dynamic(() => import('./ClientBinaryTool'), { ssr: false });

export default function BinaryPage() {
    return <ClientBinaryTool />;
}
