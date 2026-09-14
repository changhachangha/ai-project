import type { Metadata } from 'next';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "API 테스터",
    description: "RESTful API 요청을 테스트하고 응답을 확인합니다.",
    alternates: {
        canonical: "/developer/api-tester",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
