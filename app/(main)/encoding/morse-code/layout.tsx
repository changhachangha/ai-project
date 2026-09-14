import type { Metadata } from 'next';
import RelatedTools from '@/components/recommend/RelatedTools';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "Morse 코드 변환기",
    description: "텍스트를 Morse 코드로 변환하거나 Morse 코드를 텍스트로 변환합니다.",
    alternates: {
        canonical: "/encoding/morse-code",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <RelatedTools toolId='morse-code' />
        </>
    );
}
