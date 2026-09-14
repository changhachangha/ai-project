import type { Metadata } from 'next';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "SQL 포매터",
    description: "SQL 쿼리를 정리하고 가독성을 개선합니다.",
    alternates: {
        canonical: "/text/sql-formatter",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
