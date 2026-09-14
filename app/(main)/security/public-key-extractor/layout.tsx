import type { Metadata } from 'next';
import RelatedTools from '@/components/recommend/RelatedTools';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "공개키 추출기",
    description: "개인키에서 공개키를 추출하고 다양한 형식으로 변환합니다.",
    alternates: {
        canonical: "/security/public-key-extractor",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <RelatedTools toolId='public-key-extractor' />
        </>
    );
}
