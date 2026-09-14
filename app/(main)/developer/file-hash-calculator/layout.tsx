import type { Metadata } from 'next';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "파일 해시 계산기",
    description: "업로드된 파일의 MD5, SHA1, SHA256 해시값을 계산합니다.",
    alternates: {
        canonical: "/developer/file-hash-calculator",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
