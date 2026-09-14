import type { Integration } from '@/app/data/types';
import type { Recommendation, RecommendReason, ScoreBreakdown, ScoredTool } from './types';
import { MAX_PER_CATEGORY, SIGNAL_WEIGHTS, TAG_OVERLAP_CAP } from './weights';

/**
 * related 선언을 방향 없는 인접 맵으로 확장한다.
 *
 * `related` 는 한쪽에만 적히는 경우가 많다(예: JWT 디코더 → Base64 만 선언).
 * 관계 자체는 대칭이므로, 읽는 쪽에서 양방향으로 펼쳐 47개 전 선언을
 * 중복 없이 활용한다. 데이터를 양쪽에 중복 기재하지 않아도 되게 하는 장치다.
 */
export function buildRelatedMap(tools: Integration[]): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();
    const knownIds = new Set(tools.map((tool) => tool.id));

    for (const tool of tools) {
        if (!map.has(tool.id)) map.set(tool.id, new Set());
    }

    for (const tool of tools) {
        for (const relatedId of tool.related ?? []) {
            // 존재하지 않는 id 는 조용히 무시한다.
            // (데이터 오타는 validate-recommend.js 가 배포 전에 잡는다)
            if (!knownIds.has(relatedId) || relatedId === tool.id) continue;

            map.get(tool.id)!.add(relatedId);
            if (!map.has(relatedId)) map.set(relatedId, new Set());
            map.get(relatedId)!.add(tool.id);
        }
    }

    return map;
}

/** 두 도구의 태그 교집합 개수 */
export function countTagOverlap(a: Integration, b: Integration): number {
    const aTags = new Set(a.tags ?? []);
    return (b.tags ?? []).filter((tag) => aTags.has(tag)).length;
}

/**
 * 규칙 기반 점수 계산.
 * 대상 도구를 제외한 모든 도구에 대해 신호별 점수를 매기고 합산한다.
 */
export function scoreByRules(
    toolId: string,
    tools: Integration[],
    relatedMap: Map<string, Set<string>> = buildRelatedMap(tools)
): ScoredTool[] {
    const source = tools.find((tool) => tool.id === toolId);
    if (!source) return [];

    const relatedIds = relatedMap.get(toolId) ?? new Set<string>();
    const scored: ScoredTool[] = [];

    for (const tool of tools) {
        if (tool.id === toolId) continue;

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
            // 태그가 많은 도구가 무조건 이기지 않도록 상한을 둔다.
            breakdown['tag-overlap'] = Math.min(overlap, TAG_OVERLAP_CAP) * SIGNAL_WEIGHTS.tagOverlap;
            reasons.push('tag-overlap');
        }

        const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
        if (score <= 0) continue;

        scored.push({ tool, score, reasons, breakdown });
    }

    return scored;
}

/**
 * 점수 내림차순 정렬.
 *
 * 동점일 때는 id 사전순으로 고정한다. 정렬을 안정적으로 유지하지 않으면
 * 같은 입력에도 순서가 흔들려 테스트가 불안정해지고, 사용자에게도
 * 새로고침마다 목록이 바뀌는 것처럼 보인다.
 */
export function sortScored(scored: ScoredTool[]): ScoredTool[] {
    return [...scored].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.tool.id.localeCompare(b.tool.id);
    });
}

/**
 * 다양성 규칙 적용.
 * 같은 카테고리에서 MAX_PER_CATEGORY 개까지만 뽑고, 남은 자리는 다음 순위로 채운다.
 */
export function applyDiversity(scored: ScoredTool[], limit: number): ScoredTool[] {
    const perCategory = new Map<string, number>();
    const picked: ScoredTool[] = [];
    const deferred: ScoredTool[] = [];

    for (const item of scored) {
        const used = perCategory.get(item.tool.category) ?? 0;
        if (used < MAX_PER_CATEGORY) {
            perCategory.set(item.tool.category, used + 1);
            picked.push(item);
        } else {
            deferred.push(item);
        }

        if (picked.length >= limit) return picked;
    }

    // 카테고리 제한 때문에 자리가 남았다면 보류분으로 채운다.
    for (const item of deferred) {
        if (picked.length >= limit) break;
        picked.push(item);
    }

    return picked;
}

/** 규칙 기반 추천의 최종 진입점 */
export function recommendByRules(
    toolId: string,
    tools: Integration[],
    limit: number
): Recommendation[] {
    const relatedMap = buildRelatedMap(tools);
    const scored = sortScored(scoreByRules(toolId, tools, relatedMap));

    return applyDiversity(scored, limit).map(({ tool, score, reasons }) => ({ tool, score, reasons }));
}

/**
 * 카테고리를 번갈아 가며 고르는 기본 추천.
 *
 * 카탈로그가 카테고리별로 이어 붙여져 있어 앞에서 N개를 자르면
 * 한 카테고리만 노출된다(실제로 기존 홈은 인코딩 도구 10개만 보여줬다).
 * 라운드로빈으로 뽑아 첫 화면부터 여러 카테고리가 섞이게 한다.
 */
export function selectByRoundRobin(tools: Integration[], limit: number): Recommendation[] {
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

        // 모든 카테고리를 다 소진하면 종료한다.
        if (!added) break;
        cursor += 1;
    }

    return picked;
}

/**
 * 홈 추천 영역에 쓸 목록을 만든다.
 *
 * seedIds(즐겨찾기·최근 사용)가 있으면 그 도구들과 연관된 것을 위로 올리고,
 * 없으면 카테고리 라운드로빈으로 다양성만 확보한다.
 * 개인화 신호가 전혀 없는 첫 방문자도 쓸 만한 목록을 받게 하는 것이 목적이다.
 */
export function selectFeatured(
    tools: Integration[],
    limit: number,
    seedIds: string[] = []
): Recommendation[] {
    const validSeeds = seedIds.filter((id) => tools.some((tool) => tool.id === id));
    if (validSeeds.length === 0) {
        return selectByRoundRobin(tools, limit);
    }

    const seedSet = new Set(validSeeds);
    const relatedMap = buildRelatedMap(tools);
    const totals = new Map<string, ScoredTool>();

    // 여러 seed 의 점수를 합산한다. 많이 쓴 도구의 이웃이 자연히 위로 올라온다.
    for (const seedId of validSeeds) {
        for (const item of scoreByRules(seedId, tools, relatedMap)) {
            if (seedSet.has(item.tool.id)) continue;

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

    const ranked = applyDiversity(sortScored([...totals.values()]), limit).map(({ tool, score, reasons }) => ({
        tool,
        score,
        reasons,
    }));

    // 개인화 결과가 모자라면 라운드로빈으로 채워 항상 limit 을 맞춘다.
    if (ranked.length >= limit) return ranked;

    const seen = new Set(ranked.map((item) => item.tool.id));
    for (const item of selectByRoundRobin(tools, tools.length)) {
        if (ranked.length >= limit) break;
        if (seen.has(item.tool.id)) continue;
        ranked.push(item);
    }

    return ranked;
}
