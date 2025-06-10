'use client';

import { groupedTools } from '../data/integrations';
import CategoryFilter from './integrations/components/CategoryFilter';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    // 사이드바의 열림/닫힘 상태를 관리하기 위한 state
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* CategoryFilter에 isOpen과 onClose props를 전달합니다.
              - isOpen: 사이드바가 열려있는지 여부
              - onClose: 사이드바를 닫는 함수
            */}
            <CategoryFilter groupedTools={groupedTools} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* 모바일 화면에서만 보이는 헤더와 메뉴 버튼 */}
                <header className="p-4 md:p-6 md:pb-0 flex items-center gap-4 md:hidden">
                    <Button
                        variant="outline"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSidebarOpen(true)} // 버튼 클릭 시 사이드바 열기
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-bold">Tools</h1>
                </header>
                {children}
            </main>
        </div>
    );
}
