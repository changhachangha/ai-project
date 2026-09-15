'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { allTools } from '@/app/data/integrations';
import { useToolCatalog } from '@/hooks/useToolCatalog';
import { toolPath } from '@/lib/utils/paths';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const router = useRouter();

    // 이름·설명 부분 일치가 아니라 필드 가중치 랭킹(태그·카테고리 포함)을 쓴다.
    const { query, setQuery, searchHits } = useToolCatalog({ tools: allTools });

    // 검색어가 없으면 전체 목록, 있으면 랭킹 결과.
    const visibleTools = query.trim() ? searchHits.map((hit) => hit.tool) : allTools;

    const handleToolSelect = (toolId: string) => {
        const tool = allTools.find((item) => item.id === toolId);
        if (!tool) return;

        router.push(toolPath(tool));
        onClose();
    };

    // Cmd/Ctrl+K 단축키는 app-providers.tsx 가 단독으로 등록한다.
    // 여기서도 등록하면 한 번의 keydown 에 토글이 두 번 실행돼 팔레트가 열리지 않는다.

    // 닫힐 때 이전 검색어가 남지 않도록 초기화한다.
    useEffect(() => {
        if (!isOpen) setQuery('');
    }, [isOpen, setQuery]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>도구 검색</DialogTitle>
                    <DialogDescription>도구 이름 또는 설명으로 검색해 바로 이동할 수 있습니다.</DialogDescription>
                </DialogHeader>
                <Input
                    placeholder='도구 검색...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className='col-span-3'
                    autoFocus
                />
                <div className='grid gap-2 py-4 max-h-[50vh] overflow-y-auto'>
                    {visibleTools.length > 0 ? (
                        visibleTools.map((tool) => (
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
