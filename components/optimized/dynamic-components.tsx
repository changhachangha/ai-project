import dynamic from 'next/dynamic';
import { PageLoading } from '@/components/loading-spinner';

// 명령 팔레트를 동적으로 로드
export const DynamicCommandPalette = dynamic(() => import('@/components/command-palette/CommandPalette'), {
    loading: () => <div className='fixed inset-0 bg-black/50 animate-pulse' />,
    ssr: false,
});

// 테마 토글을 동적으로 로드
export const DynamicThemeToggle = dynamic(
    () => import('@/components/theme-toggle').then((mod) => ({ default: mod.ThemeToggle })),
    {
        loading: () => (
            <div className='inline-flex items-center justify-center size-9 rounded-md animate-pulse bg-muted' />
        ),
        ssr: false,
    }
);

// JSON 포매터 페이지를 동적으로 로드
export const DynamicJsonFormatter = dynamic(() => import('@/app/(main)/text/json-formatter/page'), {
    loading: () => <PageLoading text='JSON 포매터 로딩 중...' />,
});

// Base64 도구를 동적으로 로드
export const DynamicBase64Tool = dynamic(() => import('@/app/(main)/encoding/base64/page'), {
    loading: () => <PageLoading text='Base64 도구 로딩 중...' />,
});

// 카테고리 필터를 동적으로 로드
export const DynamicCategoryFilter = dynamic(() => import('@/app/(main)/integrations/components/CategoryFilter'), {
    loading: () => <div className='w-64 h-screen bg-muted animate-pulse' />,
});

// 에러 바운더리를 동적으로 로드
export const DynamicErrorBoundary = dynamic(
    () => import('@/components/error-boundary').then((mod) => ({ default: mod.ErrorBoundary })),
    {
        loading: () => <div>Loading...</div>,
    }
);
