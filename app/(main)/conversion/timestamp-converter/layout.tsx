import type { Metadata } from 'next';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: '타임스탬프 변환기',
    description: 'Unix 타임스탬프와 사람이 읽을 수 있는 날짜 형식을 상호 변환합니다.',
    alternates: {
        canonical: '/conversion/timestamp-converter',
    },
};

export default function TimestampLayout({ children }: { children: React.ReactNode }) {
    return <div className='flex flex-col items-center justify-center min-h-screen py-2'>{children}</div>;
}
