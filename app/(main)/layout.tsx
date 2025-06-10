'use client';

// 수정: groupedTools를 import합니다.
import { groupedTools } from '../data/integrations';
// 수정: CategoryFilter의 경로를 확인합니다.
import CategoryFilter from './integrations/components/CategoryFilter';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    // 레이아웃의 로직이 매우 간단해집니다.
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* 수정: groupedTools 데이터를 props로 전달합니다. */}
            <CategoryFilter groupedTools={groupedTools} />
            <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        </div>
    );
}
