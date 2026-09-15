'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Integration } from '@/app/data/types';
import type { SearchHit, UsageMap } from '@/lib/recommend';

import { readUsage, recommendFeatured, searchTools, DEFAULT_FEATURED_LIMIT, REASON_LABELS } from '@/lib/recommend';
import { useFavorites } from '@/hooks/useFavorites';

export type ToolSortValue = 'name-asc' | 'name-desc' | 'category';

/** 정렬 옵션 라벨. 홈과 목록 페이지가 같은 배열을 따로 갖고 있던 것을 여기로 모은다. */
export const TOOL_SORT_OPTIONS: { value: ToolSortValue; label: string }[] = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'category', label: 'Category' },
];

export type ToolCatalogOptions = {
    /** 카탈로그 대상 도구. 홈/목록은 allTools, 카테고리 페이지는 해당 카테고리만 넘긴다. */
    tools: Integration[];
    /** 외부(URL 파라미터 등)에서 카테고리를 제어할 때. 넘기면 내부 상태 대신 이 값을 쓴다. */
    category?: string;
    /** 내부 카테고리 상태의 초기값. 기본은 allCategoryLabel. */
    defaultCategory?: string;
    /** '전체' 항목의 라벨. 기본 'All'. */
    allCategoryLabel?: string;
    initialSort?: ToolSortValue;
    /** 홈 추천 영역 노출 개수 */
    featuredLimit?: number;
};

/**
 * 카탈로그 UX 상태 훅.
 *
 * 홈·integrations·encoding·CommandPalette 네 화면이 같은 상태
 * (검색어, 카테고리, 정렬, 즐겨찾기, 사용 기록, 경로 생성)를 따로 구현하고
 * 있었다. 복제본마다 다른 버그가 있었다(즐겨찾기 덮어쓰기, 카테고리 누락,
 * naive 검색). 신호는 전부 이 훅 안에 두고 화면은 렌더만 담당한다.
 *
 * 저장소 쓰기는 사용자 액션(toggle)에서만 한다. 마운트 시 읽은 값을
 * 다시 쓰면 아직 로드되지 않은 빈 상태로 기존 데이터를 덮어쓴다.
 */
export function useToolCatalog({
    tools,
    category: controlledCategory,
    defaultCategory,
    allCategoryLabel = 'All',
    initialSort = 'name-asc',
    featuredLimit = DEFAULT_FEATURED_LIMIT,
}: ToolCatalogOptions) {
    const [query, setQuery] = useState('');
    const [internalCategory, setInternalCategory] = useState(defaultCategory ?? allCategoryLabel);
    const [sortOption, setSortOption] = useState<ToolSortValue>(initialSort);
    // 서버/클라이언트 첫 렌더 일치를 위해 빈 값으로 시작하고 effect 에서 읽는다.
    const [usage, setUsage] = useState<UsageMap>({});

    const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();

    useEffect(() => {
        setUsage(readUsage());
    }, []);

    const category = controlledCategory ?? internalCategory;
    const setCategory = controlledCategory === undefined ? setInternalCategory : () => {};

    // 카테고리 목록은 데이터에서 파생한다. 하드코딩 목록은 새 카테고리가
    // 데이터에 추가돼도 필터에서 빠지는 버그를 낳았다('특수 인코딩' 누락).
    const categories = useMemo(() => [...new Set(tools.map((tool) => tool.category))], [tools]);

    const searchHits = useMemo<SearchHit[]>(
        () => searchTools(tools, query, { usage, favorites }),
        [tools, query, usage, favorites]
    );

    // 카테고리 필터는 검색과 독립이라 먼저 적용한다.
    const visibleTools = useMemo(() => {
        const pool =
            category === allCategoryLabel ? tools : tools.filter((tool) => tool.category === category);

        // 검색 중에는 관련도 순이 사용자 입력 의도를 가장 잘 반영한다.
        if (query.trim()) return searchHits.filter((hit) => pool.includes(hit.tool)).map((hit) => hit.tool);

        return [...pool].sort((a, b) => {
            switch (sortOption) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
    }, [tools, category, allCategoryLabel, query, searchHits, sortOption]);

    const favoriteTools = useMemo(
        () => tools.filter((tool) => favorites.includes(tool.id)),
        [tools, favorites]
    );

    // 홈 추천 영역. 즐겨찾기·최근 사용을 seed 로 이웃 도구를 끌어올린다.
    const featured = useMemo(
        () => recommendFeatured(tools, featuredLimit, { usage, favorites }),
        [tools, featuredLimit, usage, favorites]
    );
    const featuredTools = useMemo(() => featured.map((item) => item.tool), [featured]);
    const featuredReasons = useMemo(
        () =>
            Object.fromEntries(
                featured.map((item) => [
                    item.tool.id,
                    item.reasons.map((reason) => REASON_LABELS[reason]).join(' · '),
                ])
            ) as Record<string, string>,
        [featured]
    );

    return {
        query,
        setQuery,
        category,
        setCategory,
        categories,
        sortOption,
        setSortOption,
        sortOptions: TOOL_SORT_OPTIONS,
        favorites,
        toggleFavorite,
        isFavorite,
        usage,
        searchHits,
        visibleTools,
        favoriteTools,
        featuredTools,
        featuredReasons,
    };
}

export default useToolCatalog;
