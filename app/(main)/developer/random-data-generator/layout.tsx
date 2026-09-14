import type { Metadata } from 'next';
import RelatedTools from '@/components/recommend/RelatedTools';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "랜덤 데이터 생성기",
    description: "테스트용 랜덤 데이터(이름, 이메일, 주소 등)를 생성합니다.",
    alternates: {
        canonical: "/developer/random-data-generator",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <RelatedTools toolId='random-data-generator' />
        </>
    );
}
