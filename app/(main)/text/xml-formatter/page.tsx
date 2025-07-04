'use client';

import dynamic from 'next/dynamic';

const XmlFormatterClient = dynamic(() => import('./XmlFormatterClient'), {
    ssr: false,
});

export default function XmlFormatterPage() {
    return <XmlFormatterClient />;
}
