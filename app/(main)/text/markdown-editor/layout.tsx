import type { Metadata } from 'next';
import RelatedTools from '@/components/recommend/RelatedTools';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "Markdown 에디터",
    description: "실시간 미리보기가 있는 마크다운 편집기입니다.",
    alternates: {
        canonical: "/text/markdown-editor",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <RelatedTools toolId='markdown-editor' />
        </>
    );
}
