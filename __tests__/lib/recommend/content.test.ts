import { allTools } from '@/app/data/integrations';
import {
    buildIndex,
    cosineSimilarity,
    recommendByContent,
    similarityMap,
} from '@/lib/recommend/content';

describe('cosineSimilarity', () => {
    const vec = (entries: Record<string, number>) => new Map(Object.entries(entries));

    it('같은 벡터는 1 이다', () => {
        const v = vec({ a: 1, b: 2 });
        expect(cosineSimilarity(v, v)).toBeCloseTo(1, 10);
    });

    it('겹치는 항이 없으면 0 이다', () => {
        expect(cosineSimilarity(vec({ a: 1 }), vec({ b: 1 }))).toBe(0);
    });

    it('빈 벡터는 0 이다', () => {
        expect(cosineSimilarity(new Map(), vec({ a: 1 }))).toBe(0);
        expect(cosineSimilarity(vec({ a: 1 }), new Map())).toBe(0);
    });

    it('벡터 크기가 달라도 방향이 같으면 1 이다', () => {
        expect(cosineSimilarity(vec({ a: 1, b: 1 }), vec({ a: 5, b: 5 }))).toBeCloseTo(1, 10);
    });
});

describe('buildIndex', () => {
    it('도구마다 항목이 생기고 idf 가 양수다', () => {
        const index = buildIndex(allTools);

        expect(index.termCounts.size).toBe(allTools.length);
        expect([...index.idf.values()].every((value) => value > 0)).toBe(true);
    });

    it('여러 도구에 나오는 토큰의 idf 가 더 낮다', () => {
        const index = buildIndex(allTools);

        // 모든 도구 설명에 나오는 'json' 계열보다 희귀한 토큰의 idf 가 커야 한다.
        const common = index.idf.get('json') ?? 0;
        const rare = index.idf.get('punycode') ?? 0;

        expect(rare).toBeGreaterThan(common);
    });
});

describe('similarityMap', () => {
    it('자기 자신을 결과에서 제외한다', () => {
        const map = similarityMap('base64', allTools);

        expect(map.has('base64')).toBe(false);
    });

    it('없는 도구 id 는 빈 맵을 준다', () => {
        expect(similarityMap('없는도구', allTools).size).toBe(0);
    });

    it('유사도는 0 초과 1 이하다', () => {
        const map = similarityMap('hash-tool', allTools);

        expect(map.size).toBeGreaterThan(0);
        expect([...map.values()].every((value) => value > 0 && value <= 1.000001)).toBe(true);
    });
});

describe('recommendByContent — 실제 데이터 sanity', () => {
    it('base64 의 최상위 유사 도구는 base32 다', () => {
        const result = recommendByContent('base64', allTools, 3);

        expect(result[0].tool.id).toBe('base32');
    });

    it('hash-tool 의 상위 후보에 file-hash-calculator 가 포함된다', () => {
        const result = recommendByContent('hash-tool', allTools, 3);

        expect(result.map((item) => item.tool.id)).toContain('file-hash-calculator');
    });

    it('카테고리를 넘는 연관은 유사도가 약하게 나온다 (related 규칙이 필요한 이유)', () => {
        // jwt-decoder ↔ base64 는 실제로 함께 쓰지만 카테고리가 다르다.
        // 설명이 짧아 코사인 유사도는 0.08 수준에 그친다 — 신호는 있으나 순위를
        // 뒤집을 만큼 강하지 않다. 그래서 related 수동 매핑(가중치 5.0)이 필요하다.
        const crossCategory = similarityMap('jwt-decoder', allTools).get('base64') ?? 0;
        const sameCategoryPair = similarityMap('base64', allTools).get('base32') ?? 0;

        expect(crossCategory).toBeGreaterThan(0);
        expect(crossCategory).toBeLessThan(sameCategoryPair);
    });

    it('요청한 개수를 넘지 않고 사유가 채워진다', () => {
        const result = recommendByContent('case-converter', allTools, 4);

        expect(result.length).toBeLessThanOrEqual(4);
        expect(result.every((item) => item.reasons.includes('similar-content'))).toBe(true);
    });
});
