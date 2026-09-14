import type { Metadata } from 'next';
import RelatedTools from '@/components/recommend/RelatedTools';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "Punycode 인코더/디코더",
    description: "국제화 도메인명(IDN)을 위한 Punycode 인코딩/디코딩을 수행합니다.",
    alternates: {
        canonical: "/encoding/punycode",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <RelatedTools toolId='punycode' />
        </>
    );
}
