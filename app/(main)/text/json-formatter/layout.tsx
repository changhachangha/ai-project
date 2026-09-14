import type { Metadata } from 'next';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: 'JSON 포매터/검증기',
    description: 'JSON 데이터를 정리하고 유효성을 검사합니다.',
    alternates: {
        canonical: '/text/json-formatter',
    },
};

export default function JsonLayout({ children }: { children: React.ReactNode }) {
    return <div className='flex flex-col items-center justify-center min-h-screen py-2'>{children}</div>;
}
