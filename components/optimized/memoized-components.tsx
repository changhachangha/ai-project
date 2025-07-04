import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 메모이제이션된 카드 컴포넌트
interface OptimizedCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    badges?: string[];
    onClick?: () => void;
    className?: string;
    isSelected?: boolean;
}

export const OptimizedCard = memo<OptimizedCardProps>(
    ({ title, description, icon, badges = [], onClick, className, isSelected = false }) => {
        const handleClick = useCallback(() => {
            onClick?.();
        }, [onClick]);

        const badgeElements = useMemo(() => {
            return badges.map((badge) => (
                <span
                    key={badge}
                    className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground'
                >
                    {badge}
                </span>
            ));
        }, [badges]);

        return (
            <Card
                className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-md',
                    isSelected && 'ring-2 ring-primary',
                    className
                )}
                onClick={handleClick}
            >
                <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                        {icon}
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-sm text-muted-foreground mb-3'>{description}</p>
                    {badges.length > 0 && <div className='flex flex-wrap gap-1'>{badgeElements}</div>}
                </CardContent>
            </Card>
        );
    }
);

OptimizedCard.displayName = 'OptimizedCard';

// 메모이제이션된 도구 목록 컴포넌트
interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    icon?: React.ReactNode;
    tags?: string[];
}

interface OptimizedToolListProps {
    tools: Tool[];
    selectedId?: string;
    onSelect?: (id: string) => void;
    className?: string;
}

export const OptimizedToolList = memo<OptimizedToolListProps>(({ tools, selectedId, onSelect, className }) => {
    const handleSelect = useCallback(
        (id: string) => {
            onSelect?.(id);
        },
        [onSelect]
    );

    const toolElements = useMemo(() => {
        return tools.map((tool) => (
            <OptimizedCard
                key={tool.id}
                title={tool.name}
                description={tool.description}
                icon={tool.icon}
                badges={tool.tags}
                onClick={() => handleSelect(tool.id)}
                isSelected={selectedId === tool.id}
            />
        ));
    }, [tools, selectedId, handleSelect]);

    return <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>{toolElements}</div>;
});

OptimizedToolList.displayName = 'OptimizedToolList';

// 메모이제이션된 검색 결과 컴포넌트
interface SearchResult {
    id: string;
    title: string;
    description: string;
    category: string;
    relevance: number;
}

interface HighlightedSearchResult extends SearchResult {
    highlightedTitle: string;
    highlightedDescription: string;
}

interface OptimizedSearchResultsProps {
    results: SearchResult[];
    query: string;
    onSelect?: (id: string) => void;
    className?: string;
}

export const OptimizedSearchResults = memo<OptimizedSearchResultsProps>(({ results, query, onSelect, className }) => {
    const handleSelect = useCallback(
        (id: string) => {
            onSelect?.(id);
        },
        [onSelect]
    );

    const highlightedResults = useMemo((): HighlightedSearchResult[] => {
        if (!query)
            return results.map((result) => ({
                ...result,
                highlightedTitle: result.title,
                highlightedDescription: result.description,
            }));

        return results.map((result) => ({
            ...result,
            highlightedTitle: highlightText(result.title, query),
            highlightedDescription: highlightText(result.description, query),
        }));
    }, [results, query]);

    const resultElements = useMemo(() => {
        return highlightedResults.map((result) => (
            <div
                key={result.id}
                className='p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors'
                onClick={() => handleSelect(result.id)}
            >
                <h3 className='font-medium mb-1' dangerouslySetInnerHTML={{ __html: result.highlightedTitle }} />
                <p
                    className='text-sm text-muted-foreground mb-2'
                    dangerouslySetInnerHTML={{ __html: result.highlightedDescription }}
                />
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground'>
                    {result.category}
                </span>
            </div>
        ));
    }, [highlightedResults, handleSelect]);

    return <div className={cn('space-y-2', className)}>{resultElements}</div>;
});

OptimizedSearchResults.displayName = 'OptimizedSearchResults';

// 텍스트 하이라이트 유틸리티
function highlightText(text: string, query: string): string {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

// 메모이제이션된 액션 버튼 그룹
interface ActionButtonsProps {
    onCopy?: () => void;
    onDownload?: () => void;
    onClear?: () => void;
    onFormat?: () => void;
    disabled?: boolean;
    className?: string;
}

export const OptimizedActionButtons = memo<ActionButtonsProps>(
    ({ onCopy, onDownload, onClear, onFormat, disabled = false, className }) => {
        const handleCopy = useCallback(() => {
            onCopy?.();
        }, [onCopy]);

        const handleDownload = useCallback(() => {
            onDownload?.();
        }, [onDownload]);

        const handleClear = useCallback(() => {
            onClear?.();
        }, [onClear]);

        const handleFormat = useCallback(() => {
            onFormat?.();
        }, [onFormat]);

        return (
            <div className={cn('flex gap-2', className)}>
                {onFormat && (
                    <Button onClick={handleFormat} disabled={disabled} variant='default'>
                        포맷
                    </Button>
                )}
                {onCopy && (
                    <Button onClick={handleCopy} disabled={disabled} variant='outline'>
                        복사
                    </Button>
                )}
                {onDownload && (
                    <Button onClick={handleDownload} disabled={disabled} variant='outline'>
                        다운로드
                    </Button>
                )}
                {onClear && (
                    <Button onClick={handleClear} disabled={disabled} variant='outline'>
                        지우기
                    </Button>
                )}
            </div>
        );
    }
);

OptimizedActionButtons.displayName = 'OptimizedActionButtons';
