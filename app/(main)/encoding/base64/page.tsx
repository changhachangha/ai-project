'use client';

import dynamic from 'next/dynamic';

// 클라이언트 컴포넌트를 동적으로 로드하고 SSR을 비활성화합니다.
const DynamicClientBase64Tool = dynamic(() => import('./ClientBase64Tool'), {
    ssr: false, // 서버 측 렌더링 비활성화
});

export default function Base64Tool() {
    return <DynamicClientBase64Tool />;
}
