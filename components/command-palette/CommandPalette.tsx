'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { allTools } from '@/app/data/integrations';
import { getPathForCategory } from '@/lib/utils/routing';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    togglePalette: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, togglePalette }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const filteredTools = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return allTools;

        return allTools.filter(
            (tool) =>
                tool.name.toLowerCase().includes(keyword) || tool.description.toLowerCase().includes(keyword)
        );
    }, [searchTerm]);

    const handleToolSelect = (toolId: string) => {
        const tool = allTools.find((item) => item.id === toolId);
        if (!tool) return;

        router.push(`/${getPathForCategory(tool.category)}/${tool.id}`);
        onClose();
    };

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                togglePalette();
            }
        },
        [togglePalette]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    // 닫힐 때 이전 검색어가 남지 않도록 초기화한다.
    useEffect(() => {
        if (!isOpen) setSearchTerm('');
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>도구 검색</DialogTitle>
                    <DialogDescription>도구 이름 또는 설명으로 검색해 바로 이동할 수 있습니다.</DialogDescription>
                </DialogHeader>
                <Input
                    placeholder='도구 검색...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='col-span-3'
                    autoFocus
                />
                <div className='grid gap-2 py-4 max-h-[50vh] overflow-y-auto'>
                    {filteredTools.length > 0 ? (
                        filteredTools.map((tool) => (
                            <div
                                key={tool.id}
                                className='p-2 border rounded-md cursor-pointer hover:bg-muted'
                                onClick={() => handleToolSelect(tool.id)}
                            >
                                <div className='font-medium'>{tool.name}</div>
                                <div className='text-xs text-muted-foreground line-clamp-1'>{tool.description}</div>
                            </div>
                        ))
                    ) : (
                        <p className='text-center text-muted-foreground'>검색 결과가 없습니다.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CommandPalette;
