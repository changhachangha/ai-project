'use client';

import dynamic from 'next/dynamic';

const BinaryToolUI = dynamic(() => import('./BinaryToolUI'), { ssr: false });

export default function ClientBinaryTool() {
    return <BinaryToolUI />;
}
