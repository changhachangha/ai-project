'use client';

import dynamic from 'next/dynamic';

const DynamicClientCsvJsonConverterTool = dynamic(() => import('./ClientCsvJsonConverterTool'), {
    ssr: false, // 서버 측 렌더링 비활성화
    loading: () => <p>로딩 중...</p>, // 로딩 컴포넌트 추가
});

export default function CsvJsonConverterTool() {
    return <DynamicClientCsvJsonConverterTool />;
}
