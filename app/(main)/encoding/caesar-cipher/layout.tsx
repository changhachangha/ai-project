import type { Metadata } from 'next';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: "ROT13/Caesar 암호",
    description: "ROT13 및 Caesar 암호를 사용하여 텍스트를 암호화/복호화합니다.",
    alternates: {
        canonical: "/encoding/caesar-cipher",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
