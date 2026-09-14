import type { Metadata } from 'next';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "마크다운 테이블 생성기",
    description: "시각적으로 마크다운 테이블을 생성하고 편집합니다.",
    alternates: {
        canonical: "/text/markdown-table-generator",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
