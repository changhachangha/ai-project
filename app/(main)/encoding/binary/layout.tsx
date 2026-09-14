import type { Metadata } from 'next';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "진수 변환기",
    description: "2진수, 8진수, 10진수, 16진수 간 변환을 수행합니다.",
    alternates: {
        canonical: "/encoding/binary",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
