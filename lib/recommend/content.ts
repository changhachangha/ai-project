import type { Integration } from '@/app/data/types';
import { buildDocumentText, tokenize } from './tokenize';

/**
 * TF-IDF 인덱스.
 * 도구 수가 47개로 고정적이라 미리 만들어 두고 재사용하는 편이 낫다.
 */
export type ContentIndex = {
    /** 도구 id → 토큰별 등장 횟수 */
    termCounts: Map<string, Map<string, number>>;
    /** 토큰 → 역문서빈도 (희귀한 토큰일수록 큼) */
    idf: Map<string, number>;
};

function countTerms(tokens: string[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const token of tokens) {
        counts.set(token, (counts.get(token) ?? 0) + 1);
    }
    return counts;
}

/**
 * 전체 도구로 TF-IDF 인덱스를 만든다.
 *
 * IDF 는 `log(1 + N / df)` 를 쓴다. 흔한 토큰(예: 'json')의 가중치를 낮춰
 * 모든 도구가 비슷하게 보이는 것을 막는다. +1 을 더해 df 가 N 과 같아도 0 이 되지 않게 한다.
 */
export function buildIndex(tools: Integration[]): ContentIndex {
    const termCounts = new Map<string, Map<string, number>>();
    const documentFrequency = new Map<string, number>();

    for (const tool of tools) {
        const counts = countTerms(tokenize(buildDocumentText(tool)));
        termCounts.set(tool.id, counts);

        for (const token of counts.keys()) {
            documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
        }
    }

    const total = tools.length || 1;
    const idf = new Map<string, number>();
    for (const [token, df] of documentFrequency) {
        idf.set(token, Math.log(1 + total / df));
    }

    return { termCounts, idf };
}

/** TF-IDF 벡터 (L2 정규화 전) */
function toVector(counts: Map<string, number>, idf: Map<string, number>): Map<string, number> {
    const vector = new Map<string, number>();
    for (const [token, count] of counts) {
        // 서브리니어 TF: 같은 토큰이 여러 번 나와도 이득이 완만하게 증가한다.
        const weight = (1 + Math.log(count)) * (idf.get(token) ?? 0);
        if (weight > 0) vector.set(token, weight);
    }
    return vector;
}

function magnitude(vector: Map<string, number>): number {
    let sum = 0;
    for (const value of vector.values()) sum += value * value;
    return Math.sqrt(sum);
}

/**
 * 두 도구의 코사인 유사도 (0~1).
 * 벡터 크기 차이를 없애 도구 설명 길이에 좌우되지 않게 한다.
 */
export function cosineSimilarity(
    a: Map<string, number>,
    b: Map<string, number>,
    aMagnitude = magnitude(a),
    bMagnitude = magnitude(b)
): number {
    if (aMagnitude === 0 || bMagnitude === 0) return 0;

    // 토큰 수가 적은 쪽을 순회해 비교 횟수를 줄인다.
    const [small, large] = a.size <= b.size ? [a, b] : [b, a];
    let dot = 0;
    for (const [token, value] of small) {
        const other = large.get(token);
        if (other) dot += value * other;
    }

    return dot / (aMagnitude * bMagnitude);
}

/**
 * 인덱스 캐시.
 *
 * 카탈로그(allTools)는 모듈 상수라 참조가 바뀌지 않는다. 도구 페이지를 옮길 때마다
 * 47개 문서를 다시 토큰화하는 낭비를 막기 위해 배열 참조를 키로 재사용한다.
 * (WeakMap 이라 배열이 회수되면 캐시도 함께 사라진다)
 */
const indexCache = new WeakMap<Integration[], ContentIndex>();

/** 인덱스를 가져온다. 없으면 만들어 캐시한다. */
export function getIndex(tools: Integration[]): ContentIndex {
    const cached = indexCache.get(tools);
    if (cached) return cached;

    const built = buildIndex(tools);
    indexCache.set(tools, built);
    return built;
}

/**
 * 특정 도구와 나머지 도구의 유사도 맵.
 * 자기 자신은 결과에서 제외한다.
 */
export function similarityMap(
    toolId: string,
    tools: Integration[],
    index: ContentIndex = getIndex(tools)
): Map<string, number> {
    const result = new Map<string, number>();
    const sourceCounts = index.termCounts.get(toolId);
    if (!sourceCounts) return result;

    const sourceVector = toVector(sourceCounts, index.idf);
    const sourceMagnitude = magnitude(sourceVector);

    for (const tool of tools) {
        if (tool.id === toolId) continue;

        const counts = index.termCounts.get(tool.id);
        if (!counts) continue;

        const vector = toVector(counts, index.idf);
        const score = cosineSimilarity(sourceVector, vector, sourceMagnitude);

        // 0 에 가까운 값은 후보로 쓸모가 없어 버린다.
        if (score > 0) result.set(tool.id, score);
    }

    return result;
}
