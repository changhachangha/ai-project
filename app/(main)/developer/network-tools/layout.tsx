import type { Metadata } from 'next';
import RelatedTools from '@/components/recommend/RelatedTools';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "네트워크 도구",
    description: "IP 정보 조회, 포트 확인, DNS 조회 등 네트워크 관련 도구입니다.",
    alternates: {
        canonical: "/developer/network-tools",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <RelatedTools toolId='network-tools' />
        </>
    );
}
