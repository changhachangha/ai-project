'use client';

import { groupedTools } from '../data/integrations';
import CategoryFilter from './integrations/components/CategoryFilter';
import { Button } from '@/components/ui/button';
import { Menu, ArrowLeft } from 'lucide-react';
import { SidebarProvider, useSidebar } from '@/lib/context/SidebarContext';
import { useCallback } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
    );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen, setSidebarOpen } = useSidebar();
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    const handleCloseSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, [setSidebarOpen]);

    return (
        <div className='flex h-screen bg-background overflow-hidden'>
            {/* CategoryFilter에 isOpen과 onClose props를 전달합니다.
              - isOpen: 사이드바가 열려있는지 여부
              - onClose: 사이드바를 닫는 함수
            */}
            <CategoryFilter groupedTools={groupedTools} isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

            <main className='flex-1 flex flex-col overflow-y-auto'>
                {/* 헤더 */}
                <header className='p-4 md:p-6 md:pb-0 flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <Button
                            variant='outline'
                            size='icon'
                            className='md:hidden'
                            onClick={() => setSidebarOpen(true)} // 버튼 클릭 시 사이드바 열기
                        >
                            <Menu className='h-5 w-5' />
                        </Button>
                        <h1 className='text-lg font-bold md:hidden'>Tools</h1>

                        {/* 모든 도구 보기 버튼 - 홈 페이지가 아닐 때만 표시 */}
                        {!isHomePage && (
                            <Link href='/' passHref>
                                <Button variant='outline' className='hidden md:flex'>
                                    <ArrowLeft className='mr-2 h-4 w-4' />
                                    모든 도구 보기
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className='flex items-center gap-4'>
                        {/* 모바일에서 모든 도구 보기 버튼 */}
                        {!isHomePage && (
                            <Link href='/' passHref>
                                <Button variant='outline' size='sm' className='md:hidden'>
                                    <ArrowLeft className='h-4 w-4' />
                                </Button>
                            </Link>
                        )}
                        <ThemeToggle />
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}
