// app/(main)/encoding/rsa-key-generator/page.tsx

'use client';

import dynamic from 'next/dynamic';

// 클라이언트 컴포넌트를 동적으로 로드하고 SSR을 비활성화합니다.
const DynamicRsaKeyGeneratorClient = dynamic(() => import('./RsaKeyGeneratorClient'), {
    ssr: false,
});

export default function RsaKeyGeneratorTool() {
    return <DynamicRsaKeyGeneratorClient />;
}
