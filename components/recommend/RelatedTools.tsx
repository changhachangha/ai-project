'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import { allTools } from '@/app/data/integrations';
import { toolPath } from '@/lib/utils/paths';
import {
    recommend,
    recordClick,
    recordImpressions,
    readMetrics,
    getImpressedToolIds,
    DEFAULT_RELATED_LIMIT,
    REASON_LABELS,
} from '@/lib/recommend';
import { useToolUsage } from '@/hooks/useToolUsage';
import { useFavorites } from '@/hooks/useFavorites';

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
 *
 * 점수 계산은 전부 브라우저에서 한다. 도구 47개 규모라 즉시 끝나고,
 * 서버 왕복이 없어 정적 프리렌더 구조를 그대로 유지한다.
 */
export default function RelatedTools({ toolId, limit = DEFAULT_RELATED_LIMIT }: RelatedToolsProps) {
    const router = useRouter();

    // 이 컴포넌트가 47개 도구 페이지에 모두 들어가므로, 여기서 한 번 기록하면
    // 도구별로 계측 코드를 따로 심지 않아도 전체 방문이 집계된다.
    // 훅은 조건 없이 호출해야 하므로 아래 조기 반환보다 먼저 둔다.
    const { usage } = useToolUsage(toolId);
    const { favorites } = useFavorites();

    // 이전 방문에서 이미 노출된 도구는 감점한다 — 같은 추천이 매번 뜨는 것을 막는다.
    // 마운트 후에만 읽어 SSR/첫 렌더 불일치를 피한다.
    const [demoteIds, setDemoteIds] = useState<string[]>([]);
    useEffect(() => {
        setDemoteIds(getImpressedToolIds(readMetrics()));
    }, []);

    // 하이브리드 랭커: related(5.0) > 같은 카테고리(3.0) > 콘텐츠 유사도(4.0)
    // > 태그 교집합(2.0) > 최근 사용(1.5) > 즐겨찾기(1.0).
    // usage 를 그대로 넘긴다. 점수 변환은 랭커 안에서 한 번만 한다.
    const recommendations = useMemo(
        () => recommend(toolId, allTools, limit, { usage, favorites, demoteIds }),
        [toolId, limit, usage, favorites, demoteIds]
    );

    // 노출 계측.
    // 목록은 usage/favorites 가 준비되면서 한 번 더 바뀌므로, 그대로 두면
    // 같은 노출을 두 번 센다. 첫 목록만 집계해 중복을 막는다.
    const counted = useRef(false);
    useEffect(() => {
        if (counted.current || recommendations.length === 0) return;
        counted.current = true;
        recordImpressions(recommendations.map((item) => item.tool.id));
    }, [recommendations]);

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
                        onClick={() => {
                            // 어떤 추천이 실제로 눌리는지 로컬에서만 집계한다.
                            recordClick(tool.id);
                            router.push(toolPath(tool));
                        }}
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
