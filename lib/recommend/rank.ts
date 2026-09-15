import type { Integration } from '@/app/data/types';

import { getIndex, similarityMap } from './content';
import { applyDiversity, buildRelatedMap, countTagOverlap, sortScored } from './rules';
import type { Recommendation, RecommendReason, ScoreBreakdown, ScoredTool } from './types';
import { UsageMap, getRecentToolIds, getUsageScores } from './usage';
import { SIGNAL_WEIGHTS, TAG_OVERLAP_CAP } from './weights';

/**
 * 하이브리드 랭커.
 *
 * Phase 1(규칙) + Phase 2(콘텐츠 유사도) + Phase 3(사용 기록)의 신호를
 * 하나의 점수로 합친다. 각 신호는 가중치가 달라 서로 다른 신호가
 * 같은 후보를 밀어올릴 때 순위가 안정적으로 결정된다.
 *
 * 계산은 전부 브라우저에서 한다. 카탈로그가 47개로 작아
 * 서버 왕복 없이도 충분히 빠르고, 정적 프리렌더 구조를 유지할 수 있다.
 */
export type RankContext = {
    /** 도구별 사용 기록 (Phase 3) */
    usage?: UsageMap;
    /** 즐겨찾기 도구 id */
    favorites?: string[];
    /**
     * 감점 대상 id. 제외가 아니라 감점인 이유:
     * 후보가 부족할 때 목록이 비는 것보다는 중복 노출이 낫다.
     */
    demoteIds?: string[];
    /** 테스트에서 시각을 고정하기 위한 주입점 */
    now?: number;
};

type CandidateInput = {
    tool: Integration;
    relatedIds: Set<string>;
    source: Integration;
    contentScores: Map<string, number>;
    usageScores: Map<string, number>;
    favorites: Set<string>;
    demote: Set<string>;
};

/** 후보 하나의 신호별 점수를 계산한다. */
function scoreCandidate(candidate: CandidateInput): ScoredTool {
    const { tool, relatedIds, source, contentScores, usageScores, favorites, demote } = candidate;

    const breakdown: ScoreBreakdown = {};
    const reasons: RecommendReason[] = [];

    if (relatedIds.has(tool.id)) {
        breakdown.related = SIGNAL_WEIGHTS.related;
        reasons.push('related');
    }

    if (tool.category === source.category) {
        breakdown['same-category'] = SIGNAL_WEIGHTS.sameCategory;
        reasons.push('same-category');
    }

    const overlap = countTagOverlap(source, tool);
    if (overlap > 0) {
        breakdown['tag-overlap'] = Math.min(overlap, TAG_OVERLAP_CAP) * SIGNAL_WEIGHTS.tagOverlap;
        reasons.push('tag-overlap');
    }

    const content = contentScores.get(tool.id) ?? 0;
    if (content > 0) {
        breakdown['similar-content'] = content * SIGNAL_WEIGHTS.similarContent;
        reasons.push('similar-content');
    }

    const usage = usageScores.get(tool.id) ?? 0;
    if (usage > 0) {
        breakdown['recently-used'] = usage * SIGNAL_WEIGHTS.recentUsage;
        reasons.push('recently-used');
    }

    if (favorites.has(tool.id)) {
        breakdown.favorite = SIGNAL_WEIGHTS.favorite;
        reasons.push('favorite');
    }

    if (demote.has(tool.id)) {
        breakdown.alreadyShown = SIGNAL_WEIGHTS.alreadyShown;
    }

    const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

    return { tool, score, reasons, breakdown };
}

/** 주어진 source 도구를 기준으로 모든 후보를 점수화한다. */
function scoreAll(
    source: Integration,
    tools: Integration[],
    relatedMap: Map<string, Set<string>>,
    contentScores: Map<string, number>,
    usageScores: Map<string, number>,
    favorites: Set<string>,
    demote: Set<string>,
    exclude: Set<string>
): ScoredTool[] {
    const relatedIds = relatedMap.get(source.id) ?? new Set<string>();
    const scored: ScoredTool[] = [];

    for (const tool of tools) {
        if (exclude.has(tool.id)) continue;

        scored.push(
            scoreCandidate({ tool, relatedIds, source, contentScores, usageScores, favorites, demote })
        );
    }

    // 점수가 0 이하면 아무 신호도 없는 후보다. 목록을 채우려고 넣으면
    // "왜 이게 추천됐지" 하는 결과가 나온다.
    return scored.filter((item) => item.score > 0);
}

/**
 * 도구 페이지의 관련 도구 추천.
 * 현재 도구는 결과에서 항상 제외한다.
 */
export function recommend(
    toolId: string,
    tools: Integration[],
    limit: number,
    context: RankContext = {}
): Recommendation[] {
    const source = tools.find((tool) => tool.id === toolId);
    if (!source) return [];

    const { usage = {}, favorites = [], demoteIds = [], now = Date.now() } = context;

    const scored = scoreAll(
        source,
        tools,
        buildRelatedMap(tools),
        similarityMap(toolId, tools, getIndex(tools)),
        getUsageScores(usage, now),
        new Set(favorites),
        new Set(demoteIds),
        new Set([toolId])
    );

    return applyDiversity(sortScored(scored), limit).map(({ tool, score, reasons }) => ({
        tool,
        score,
        reasons,
    }));
}

/**
 * 홈 추천 영역.
 *
 * seed(즐겨찾기 + 최근 사용)가 있으면 그 도구들의 이웃을 위로 올리고,
 * 없으면 카테고리 라운드로빈으로 다양성만 확보한다.
 *
 * seed 자신은 감점한다. 즐겨찾기 탭과 최근 사용 도구는 이미 사용자가
 * 인지하고 있으므로, 홈에서는 "아직 모르는 도구"를 보여주는 편이 낫다.
 */
export function recommendFeatured(
    tools: Integration[],
    limit: number,
    context: RankContext = {}
): Recommendation[] {
    const { usage = {}, favorites = [], now = Date.now() } = context;

    const recentIds = getRecentToolIds(usage, 10, now);
    const seedIds = [...new Set([...favorites, ...recentIds])].filter((id) =>
        tools.some((tool) => tool.id === id)
    );

    if (seedIds.length === 0) {
        return selectDiverseFallback(tools, limit);
    }

    const usageScores = getUsageScores(usage, now);
    const favoriteSet = new Set(favorites);
    const seedSet = new Set(seedIds);
    const totals = new Map<string, ScoredTool>();

    // seed 별 점수를 합산한다. 여러 seed 와 가까운 도구가 자연히 위로 올라온다.
    for (const seedId of seedIds) {
        const source = tools.find((tool) => tool.id === seedId);
        if (!source) continue;

        const scored = scoreAll(
            source,
            tools,
            buildRelatedMap(tools),
            similarityMap(seedId, tools, getIndex(tools)),
            usageScores,
            favoriteSet,
            seedSet,
            new Set([seedId])
        );

        for (const item of scored) {
            const existing = totals.get(item.tool.id);
            if (!existing) {
                totals.set(item.tool.id, { ...item, breakdown: { ...item.breakdown } });
                continue;
            }

            existing.score += item.score;
            for (const [reason, value] of Object.entries(item.breakdown)) {
                const key = reason as RecommendReason;
                existing.breakdown[key] = (existing.breakdown[key] ?? 0) + (value ?? 0);
            }
            existing.reasons = [...new Set([...existing.reasons, ...item.reasons])];
        }
    }

    const ranked = applyDiversity(sortScored([...totals.values()]), limit).map(
        ({ tool, score, reasons }) => ({ tool, score, reasons })
    );

    // 개인화 결과가 모자라면 라운드로빈으로 채워 항상 limit 을 맞춘다.
    if (ranked.length >= limit) return ranked;

    const seen = new Set(ranked.map((item) => item.tool.id));
    for (const item of selectDiverseFallback(tools, tools.length)) {
        if (ranked.length >= limit) break;
        if (seen.has(item.tool.id)) continue;
        ranked.push(item);
    }

    return ranked;
}

/**
 * 개인화 신호가 없을 때의 기본 목록.
 * 카탈로그가 카테고리별로 이어 붙여져 있어 앞에서 자르면 한 카테고리만 나온다.
 * 카테고리를 번갈아 뽑아 첫 화면부터 다양하게 보이도록 한다.
 */
export function selectDiverseFallback(tools: Integration[], limit: number): Recommendation[] {
    const buckets = new Map<string, Integration[]>();
    for (const tool of tools) {
        if (!buckets.has(tool.category)) buckets.set(tool.category, []);
        buckets.get(tool.category)!.push(tool);
    }

    // 카테고리 순서를 고정해 같은 입력에 항상 같은 결과가 나오게 한다.
    const categories = [...buckets.keys()].sort((a, b) => a.localeCompare(b));
    const picked: Recommendation[] = [];
    let cursor = 0;

    while (picked.length < limit) {
        let added = false;

        for (const category of categories) {
            const bucket = buckets.get(category)!;
            if (cursor < bucket.length) {
                picked.push({ tool: bucket[cursor], score: 0, reasons: [] });
                added = true;
                if (picked.length >= limit) break;
            }
        }

        if (!added) break;
        cursor += 1;
    }

    return picked;
}
