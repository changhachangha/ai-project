'use client';

import dynamic from 'next/dynamic';

const PunycodeClient = dynamic(() => import('./PunycodeClient'), { ssr: false });

export default function PunycodePage() {
    return <PunycodeClient />;
}
