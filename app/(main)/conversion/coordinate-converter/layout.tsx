import type { Metadata } from 'next';
import RelatedTools from '@/components/recommend/RelatedTools';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "좌표 변환기",
    description: "GPS, UTM, 위경도 등 다양한 좌표계를 변환합니다.",
    alternates: {
        canonical: "/conversion/coordinate-converter",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <RelatedTools toolId='coordinate-converter' />
        </>
    );
}
