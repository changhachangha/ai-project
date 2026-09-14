'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import { allTools } from '@/app/data/integrations';
import { getPathForCategory } from '@/lib/utils/routing';
import { recommendByRules } from '@/lib/recommend/rules';
import { DEFAULT_RELATED_LIMIT } from '@/lib/recommend/weights';
import { REASON_LABELS } from '@/lib/recommend/types';

type RelatedToolsProps = {
    /** 현재 보고 있는 도구의 id. 이 도구와 연관된 도구를 계산한다. */
    toolId: string;
    limit?: number;
};

/**
 * 도구 페이지 하단의 관련 도구 목록.
 *
 * 47개 도구 레이아웃이 모두 이 컴포넌트를 같은 방식으로 쓰므로,
 * 추천 로직을 여기서만 호출하면 전체 페이지에 일괄 적용된다.
 *
 * 카탈로그(allTools)는 이미 사이드바 레이아웃이 불러오고 있어
 * 이 컴포넌트가 추가로 만드는 번들 비용은 사실상 없다.
 */
export default function RelatedTools({ toolId, limit = DEFAULT_RELATED_LIMIT }: RelatedToolsProps) {
    const router = useRouter();

    const recommendations = useMemo(() => recommendByRules(toolId, allTools, limit), [toolId, limit]);

    // 추천이 하나도 없으면 빈 섹션 제목만 남지 않도록 아예 렌더하지 않는다.
    if (recommendations.length === 0) return null;

    return (
        <section className='container mx-auto px-4 pb-10 max-w-4xl' aria-labelledby='related-tools-heading'>
            <h2 id='related-tools-heading' className='text-lg font-semibold mb-4 text-foreground'>
                관련 도구
            </h2>

            <div className='grid gap-3 sm:grid-cols-2'>
                {recommendations.map(({ tool, reasons }) => (
                    <button
                        key={tool.id}
                        type='button'
                        onClick={() => router.push(`/${getPathForCategory(tool.category)}/${tool.id}`)}
                        className='flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent'
                    >
                        <span
                            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full'
                            style={{ backgroundColor: `${tool.color}20` }}
                            aria-hidden='true'
                        >
                            <tool.icon className='h-4 w-4' style={{ color: tool.color }} />
                        </span>

                        <span className='min-w-0 flex-1'>
                            <span className='block text-sm font-medium text-card-foreground'>{tool.name}</span>
                            <span className='mt-0.5 block text-xs text-muted-foreground line-clamp-2'>
                                {tool.description}
                            </span>
                            {/* 추천 근거를 함께 보여준다. 근거가 없으면 신뢰도가 떨어지고,
                                왜 이 도구가 떴는지 사용자가 판단할 수 없다. */}
                            <span className='mt-2 inline-block text-[11px] text-muted-foreground'>
                                {reasons.map((reason) => REASON_LABELS[reason]).join(' · ')}
                            </span>
                        </span>

                        <ArrowRight className='mt-1 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
                    </button>
                ))}
            </div>
        </section>
    );
}
