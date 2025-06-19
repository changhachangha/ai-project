'use client';

import dynamic from 'next/dynamic';

const DynamicClientHexTool = dynamic(() => import('./ClientHexTool'), {
    ssr: false, // 서버 측 렌더링 비활성화
});

export default function HexTool() {
    return <DynamicClientHexTool />;
}
