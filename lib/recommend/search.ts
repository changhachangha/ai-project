import type { Integration } from '@/app/data/types';

import { splitWords } from './tokenize';
import { UsageMap, getUsageScores } from './usage';
import { SIGNAL_WEIGHTS } from './weights';

/**
 * 검색 결과 재정렬.
 *
 * 기존 검색은 이름·설명의 부분 문자열 일치 여부만 봤다. 일치하면 순서는
 * 카탈로그 배열 순이라, "json" 을 검색하면 JSON 포매터보다 JSON 을 설명에
 * 한 번 언급한 도구가 앞에 오는 일이 생겼다.
 *
 * 여기서는 매칭 위치(이름 > 태그 > 카테고리 > 설명)에 가중치를 주고,
 * Phase 3의 개인화 신호(최근 사용·즐겨찾기)를 소량 더한다.
 * 검색은 "찾기"가 목적이라 개인화 비중은 추천보다 낮게 잡는다.
 */

/** 매칭 필드별 가중치. 조정 지점을 한 곳에 모아 둔다. */
export const MATCH_WEIGHTS = {
    /** 이름이 검색어와 정확히 같음 */
    nameExact: 8.0,
    /** 이름이 검색어로 시작 */
    namePrefix: 5.0,
    /** 이름에 검색어 포함 */
    nameContains: 3.0,
    /** 태그가 검색어와 정확히 같음 */
    tagExact: 3.0,
    /** 태그에 검색어 포함 */
    tagContains: 2.0,
    /** 카테고리 일치 */
    categoryExact: 1.5,
    /** 설명에 검색어 포함 */
    descriptionContains: 1.0,
    /** 다중 단어 검색에서 단어 하나가 이름에 걸림 */
    termInName: 2.0,
    /** 다중 단어 검색에서 단어 하나가 태그에 걸림 */
    termInTag: 1.5,
    /** 다중 단어 검색에서 단어 하나가 설명에 걸림 */
    termInDescription: 0.5,
} as const;

/**
 * 검색은 개인화 신호를 낮게 반영한다.
 * 추천과 같은 가중치를 쓰면 "많이 쓴 도구"가 항상 위로 올라와
 * 사용자가 입력한 검색어의 의도가 흐려진다.
 */
export const SEARCH_PERSONALIZATION_SCALE = 0.4;

export type SearchContext = {
    usage?: UsageMap;
    favorites?: string[];
    /** 테스트에서 시각을 고정하기 위한 주입점 */
    now?: number;
};

export type SearchHit = {
    tool: Integration;
    score: number;
    /** 어떤 필드에서 걸렸는지. 디버깅과 하이라이트 구현에 쓴다 */
    matchedFields: string[];
};

/**
 * 검색어와 도구 하나의 관련도 점수.
 * 점수가 0 이면 검색어가 어디에도 걸리지 않은 것이므로 결과에서 제외한다.
 */
function scoreTool(
    tool: Integration,
    query: string,
    terms: string[],
    usageScores: Map<string, number>,
    favorites: Set<string>
): SearchHit {
    const name = tool.name.toLowerCase();
    const description = tool.description.toLowerCase();
    const category = tool.category.toLowerCase();
    const tags = tool.tags.map((tag) => tag.toLowerCase());

    const matchedFields: string[] = [];
    let score = 0;

    // 1) 이름 매칭 — 가장 강한 신호. 정확 일치 > 접두 일치 > 부분 일치로 차등을 둔다.
    if (name === query) {
        score += MATCH_WEIGHTS.nameExact;
        matchedFields.push('name');
    } else if (name.startsWith(query)) {
        score += MATCH_WEIGHTS.namePrefix;
        matchedFields.push('name');
    } else if (name.includes(query)) {
        score += MATCH_WEIGHTS.nameContains;
        matchedFields.push('name');
    }

    // 2) 태그 매칭 — 이름에 없어도 의미상 같은 도구를 잡는다.
    if (tags.some((tag) => tag === query)) {
        score += MATCH_WEIGHTS.tagExact;
        matchedFields.push('tag');
    } else if (tags.some((tag) => tag.includes(query))) {
        score += MATCH_WEIGHTS.tagContains;
        matchedFields.push('tag');
    }

    // 3) 카테고리 매칭 — "인코딩" 처럼 범주를 그대로 입력한 경우.
    if (category === query || category.includes(query)) {
        score += MATCH_WEIGHTS.categoryExact;
        matchedFields.push('category');
    }

    // 4) 설명 매칭 — 보조 신호. 설명만 걸린 도구는 이름이 걸린 도구보다 아래로 간다.
    if (description.includes(query)) {
        score += MATCH_WEIGHTS.descriptionContains;
        matchedFields.push('description');
    }

    // 5) 다중 단어 검색 — "json 변환" 처럼 단어가 나뉘어 들어오면 단어별로 부분 점수를 준다.
    for (const term of terms) {
        if (name.includes(term)) score += MATCH_WEIGHTS.termInName;
        if (tags.some((tag) => tag.includes(term))) score += MATCH_WEIGHTS.termInTag;
        if (description.includes(term)) score += MATCH_WEIGHTS.termInDescription;
    }

    // 6) 개인화 — 소량만 더한다.
    const personalization =
        (usageScores.get(tool.id) ?? 0) * SIGNAL_WEIGHTS.recentUsage +
        (favorites.has(tool.id) ? SIGNAL_WEIGHTS.favorite : 0);

    return { tool, score: score + personalization * SEARCH_PERSONALIZATION_SCALE, matchedFields };
}

/**
 * 검색어로 도구를 걸러 관련도 순으로 돌려준다.
 *
 * 검색어가 비어 있으면 빈 배열을 준다. "전체 목록"은 호출부가 정렬 옵션으로
 * 처리해야 할 일이고, 여기서 반환하면 검색과 미검색 상태가 구분되지 않는다.
 */
export function searchTools(
    tools: Integration[],
    query: string,
    context: SearchContext = {}
): SearchHit[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    const { usage = {}, favorites = [], now = Date.now() } = context;
    const terms = splitWords(normalized);
    const usageScores = getUsageScores(usage, now);
    const favoriteSet = new Set(favorites);

    return tools
        .map((tool) => scoreTool(tool, normalized, terms, usageScores, favoriteSet))
        .filter((hit) => hit.score > 0)
        .sort((a, b) => {
            // 동점은 이름 → id 순으로 고정해 새로고침마다 순서가 바뀌지 않게 한다.
            if (b.score !== a.score) return b.score - a.score;
            const byName = a.tool.name.localeCompare(b.tool.name);
            if (byName !== 0) return byName;
            return a.tool.id.localeCompare(b.tool.id);
        });
}
