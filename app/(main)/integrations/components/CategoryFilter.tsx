// app/(main)/integrations/components/CategoryFilter.tsx

'use client';

import type { Integration } from '@/app/data/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useEffect } from 'react';

import { getPathForCategory } from '@/lib/utils/routing';

type CategoryFilterProps = {
    groupedTools: {
        category: string;
        tools: Integration[];
    }[];
    isOpen: boolean;
    onClose: () => void;
};

export default function CategoryFilter({ groupedTools, isOpen, onClose }: CategoryFilterProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        console.log('CategoryFilter mounted');
        return () => console.log('CategoryFilter unmounted');
    }, []);

    useEffect(() => {
        console.log('CategoryFilter isOpen changed:', isOpen);
    }, [isOpen]);

    const [openCategory, setOpenCategory] = useState<string | null>(() => {
        const currentTool = groupedTools.flatMap((g) => g.tools).find((t) => pathname.includes(`/${t.id}`));
        return currentTool?.category || null;
    });

    const handleLinkClick = useCallback(
        (tool: Integration) => {
            // --- 수정: 동적 경로 생성 ---
            const path = `/${getPathForCategory(tool.category)}/${tool.id}`;
            router.push(path);
            onClose();
        },
        [router, onClose]
    );

    const SidebarContent = useMemo(() => {
        const InnerSidebarContent = () => (
            <>
                <div className='flex justify-between items-center p-4 md:hidden border-b border-sidebar-border'>
                    <h2 className='text-lg font-semibold text-sidebar-foreground'>Tools</h2>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={onClose}
                        className='text-sidebar-foreground hover:bg-sidebar-accent'
                    >
                        <X className='h-5 w-5' />
                    </Button>
                </div>
                <h2 className='text-lg font-semibold mb-2 px-4 pt-4 hidden md:block text-sidebar-foreground'>Tools</h2>
                <div className='flex-1 overflow-auto space-y-1 p-4 md:p-0 md:px-4'>
                    {groupedTools.map(({ category, tools }) => (
                        <div key={category}>
                            <Button
                                variant='ghost'
                                className='w-full justify-between text-sm font-semibold py-1 px-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
                                        key='content'
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className='pl-4 mt-1 space-y-1 border-l-2 border-sidebar-border ml-3 overflow-hidden'
                                    >
                                        {tools.map((tool) => (
                                            <Button
                                                key={tool.id}
                                                variant='ghost'
                                                size='sm'
                                                className={cn(
                                                    'w-full justify-start font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                                    pathname.endsWith(`/${tool.id}`) &&
                                                        'bg-sidebar-primary text-sidebar-primary-foreground font-semibold hover:bg-sidebar-primary/90'
                                                )}
                                                // --- 수정: tool 객체 전체를 전달 ---
                                                onClick={() => handleLinkClick(tool)}
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
        InnerSidebarContent.displayName = 'SidebarContent';
        return InnerSidebarContent;
    }, [onClose, groupedTools, openCategory, setOpenCategory, handleLinkClick, pathname]);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/60 z-40 md:hidden'
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        key='mobile-sidebar'
                        initial={{ x: '-100%' }}
                        animate={{ x: '0%' }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className='fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border shadow-lg flex flex-col z-50 md:hidden'
                    >
                        <SidebarContent />
                    </motion.aside>
                )}
            </AnimatePresence>

            <aside className='w-64 bg-sidebar border-r border-sidebar-border flex-col h-screen hidden md:flex'>
                <SidebarContent />
            </aside>
        </>
    );
}
