'use client';

import dynamic from 'next/dynamic';

const CaesarCipherClient = dynamic(() => import('./CaesarCipherClient'), { ssr: false });

export default function CaesarCipherPage() {
    return <CaesarCipherClient />;
}
