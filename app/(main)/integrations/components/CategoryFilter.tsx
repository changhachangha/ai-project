'use client';

import type { Integration } from '@/app/data/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

type CategoryFilterProps = {
    groupedTools: {
        category: string;
        tools: Integration[];
    }[];
    // --- 수정: 모바일 사이드바의 열림/닫힘 상태를 제어하기 위한 props 추가 ---
    isOpen: boolean;
    onClose: () => void;
};

// --- 수정: props 타입 반영 ---
export default function CategoryFilter({ groupedTools, isOpen, onClose }: CategoryFilterProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [openCategory, setOpenCategory] = useState<string | null>(() => {
        const currentTool = groupedTools.flatMap((g) => g.tools).find((t) => pathname.includes(`/encoding/${t.id}`));
        return currentTool?.category || null;
    });

    const handleLinkClick = (path: string) => {
        router.push(path);
        onClose(); // --- 추가: 링크 클릭 시 사이드바가 닫히도록 함 ---
    };

    const SidebarContent = () => (
        <>
            <div className="flex justify-between items-center p-4 md:hidden">
                <h2 className="text-lg font-semibold">Tools</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <h2 className="text-lg font-semibold mb-2 px-4 pt-4 hidden md:block">Tools</h2>
            <div className="flex-1 overflow-auto space-y-1 p-4 md:p-0 md:px-4">
                {groupedTools.map(({ category, tools }) => (
                    <div key={category}>
                        <Button
                            variant="ghost"
                            className="w-full justify-between text-sm font-semibold py-1 px-2 h-auto"
                            onClick={() => setOpenCategory((prev) => (prev === category ? null : category))}
                        >
                            {category}
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 transition-transform',
                                    openCategory === category && 'rotate-180'
                                )}
                            />
                        </Button>

                        <AnimatePresence>
                            {openCategory === category && (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="pl-4 mt-1 space-y-1 border-l-2 ml-3 overflow-hidden"
                                >
                                    {tools.map((tool) => (
                                        <Button
                                            key={tool.id}
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                'w-full justify-start font-normal text-muted-foreground hover:bg-accent',
                                                pathname.includes(`/encoding/${tool.id}`) &&
                                                    'bg-primary text-primary-foreground font-semibold hover:bg-primary/90'
                                            )}
                                            onClick={() => handleLinkClick(`/encoding/${tool.id}`)}
                                        >
                                            {tool.name}
                                        </Button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </>
    );

    return (
        <>
            {/* --- 수정: 모바일용 오버레이 사이드바 --- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 md:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: '0%' }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col z-50 md:hidden"
                    >
                        <SidebarContent />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* --- 수정: 데스크톱용 고정 사이드바 --- */}
            <aside className="w-64 bg-white shadow-md flex-col h-screen hidden md:flex">
                <SidebarContent />
            </aside>
        </>
    );
}
