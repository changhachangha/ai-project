import type { Metadata } from 'next';
import RelatedTools from '@/components/recommend/RelatedTools';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "HTML 인코더/디코더",
    description: "HTML 엔티티로 텍스트를 인코딩하거나 디코딩합니다.",
    alternates: {
        canonical: "/encoding/html",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <RelatedTools toolId='html' />
        </>
    );
}
