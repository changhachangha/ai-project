import type { Metadata } from 'next';
import RelatedTools from '@/components/recommend/RelatedTools';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "패스워드 생성기",
    description: "안전한 패스워드를 생성하고 강도를 평가합니다.",
    alternates: {
        canonical: "/security/password-generator",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <RelatedTools toolId='password-generator' />
        </>
    );
}
