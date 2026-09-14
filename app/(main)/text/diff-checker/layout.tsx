import type { Metadata } from 'next';

// NOTE: page.tsx 가 클라이언트 컴포넌트('use client')라 metadata 를 export 할 수 없다.
// 같은 세그먼트의 서버 레이아웃에서 도구별 메타데이터를 정의한다.
export const metadata: Metadata = {
    title: 'Diff 도구',
    description: '두 텍스트의 차이점을 비교하고 시각화합니다.',
    alternates: {
        canonical: '/text/diff-checker',
    },
};

export default function TextDiffLayout({ children }: { children: React.ReactNode }) {
    return <div className='flex flex-col items-center justify-center min-h-screen py-2'>{children}</div>;
}
