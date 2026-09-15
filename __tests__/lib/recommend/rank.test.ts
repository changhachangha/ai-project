import type { Integration } from '@/app/data/types';
import { allTools } from '@/app/data/integrations';
import { recommend, recommendFeatured, selectDiverseFallback } from '@/lib/recommend/rank';
import { MAX_PER_CATEGORY, SIGNAL_WEIGHTS } from '@/lib/recommend/weights';

const NOW = new Date('2026-09-14T12:00:00Z').getTime();

const makeTool = (overrides: Partial<Integration> & Pick<Integration, 'id'>): Integration => ({
    name: overrides.id,
    description: '',
    category: '기타',
    section: 'text',
    icon: (() => null) as unknown as Integration['icon'],
    color: '#000000',
    tags: [],
    ...overrides,
});

const TOOLS: Integration[] = [
    // related 로 b 를 지정 → b 가 최상위
    makeTool({ id: 'a', category: '인코딩', tags: ['인코딩'], related: ['b'] }),
    makeTool({ id: 'b', category: '인코딩', tags: ['인코딩'] }),
    // 태그가 겹치지 않아 규칙만으로는 후보가 되지 않는다.
    // 사용 기록·즐겨찾기 신호만으로 목록에 들어오는지 확인하는 용도.
    makeTool({ id: 'c', category: '보안', tags: [] }),
    makeTool({ id: 'd', category: '텍스트', tags: [] }),
    // 태그 교집합만으로 후보가 되는 도구 (감점 테스트에서 기준선으로 쓴다)
    makeTool({ id: 'e', category: '보안', tags: ['인코딩'] }),
];

describe('recommend', () => {
    it('없는 도구 id 는 빈 배열을 준다', () => {
        expect(recommend('없음', TOOLS, 4)).toEqual([]);
    });

    it('자기 자신을 결과에 넣지 않는다', () => {
        expect(recommend('a', TOOLS, 4).some((item) => item.tool.id === 'a')).toBe(false);
    });

    it('related 로 선언된 도구가 최상위로 온다', () => {
        expect(recommend('a', TOOLS, 2)[0].tool.id).toBe('b');
    });

    it('사용 기록이 있으면 해당 도구가 위로 올라온다', () => {
        // c 는 태그가 겹치지 않아 규칙만으로는 점수가 0 이다(후보에서 빠진다).
        const withoutUsage = recommend('a', TOOLS, 3).map((item) => item.tool.id);
        const withUsage = recommend('a', TOOLS, 3, {
            usage: { c: { count: 10, lastUsedAt: NOW } },
            now: NOW,
        }).map((item) => item.tool.id);

        expect(withoutUsage).not.toContain('c');
        expect(withUsage).toContain('c');
    });

    it('사용 기록에 recently-used 사유가 붙는다', () => {
        const result = recommend('a', TOOLS, 3, {
            usage: { c: { count: 5, lastUsedAt: NOW } },
            now: NOW,
        });
        const target = result.find((item) => item.tool.id === 'c');

        expect(target?.reasons).toContain('recently-used');
    });

    it('즐겨찾기에 favorite 사유가 붙는다', () => {
        const result = recommend('a', TOOLS, 3, { favorites: ['c'] });
        const target = result.find((item) => item.tool.id === 'c');

        expect(target?.reasons).toContain('favorite');
    });

    it('demoteIds 는 제외가 아니라 감점으로만 작동한다', () => {
        const normal = recommend('a', TOOLS, 4).find((item) => item.tool.id === 'b');
        const demoted = recommend('a', TOOLS, 4, { demoteIds: ['b'] }).find((item) => item.tool.id === 'b');

        expect(demoted).toBeDefined();
        expect(demoted!.score).toBeCloseTo(normal!.score + SIGNAL_WEIGHTS.alreadyShown, 6);
    });

    it('기간이 지난 사용 기록은 순위에 영향을 주지 않는다', () => {
        const result = recommend('a', TOOLS, 3, {
            usage: { c: { count: 10, lastUsedAt: NOW - 400 * 24 * 60 * 60 * 1000 } },
            now: NOW,
        });

        expect(result.some((item) => item.tool.id === 'c')).toBe(false);
    });

    it('같은 입력에 항상 같은 순서를 준다', () => {
        const first = recommend('a', TOOLS, 3).map((item) => item.tool.id);
        const second = recommend('a', TOOLS, 3).map((item) => item.tool.id);

        expect(first).toEqual(second);
    });

    it('결과에 사유가 최소 1개씩 붙는다', () => {
        expect(recommend('a', TOOLS, 4).every((item) => item.reasons.length > 0)).toBe(true);
    });

    it('다양성 규칙을 지킨다', () => {
        const crowded = [
            makeTool({ id: 'src', category: '인코딩', tags: ['공통'] }),
            ...Array.from({ length: 5 }, (_, i) =>
                makeTool({ id: `e${i}`, category: '인코딩', tags: ['공통'] })
            ),
            makeTool({ id: 's1', category: '보안', tags: ['공통'] }),
        ];

        const result = recommend('src', crowded, 3);
        const encodingCount = result.filter((item) => item.tool.category === '인코딩').length;

        expect(encodingCount).toBeLessThanOrEqual(MAX_PER_CATEGORY);
    });
});

describe('recommend — 실제 데이터', () => {
    it('jwt-decoder 추천에 related 로 선언한 base64 가 포함된다', () => {
        // 콘텐츠 유사도만으로는 0.08 수준이라 순위가 밀린다.
        // related 규칙(5.0)이 이를 뒤집는지 확인한다.
        const result = recommend('jwt-decoder', allTools, 4);

        expect(result.map((item) => item.tool.id)).toContain('base64');
    });

    it('모든 도구가 1개 이상의 추천을 만든다', () => {
        const empty = allTools.filter((tool) => recommend(tool.id, allTools, 4).length === 0);

        expect(empty).toEqual([]);
    });
});

describe('selectDiverseFallback', () => {
    it('카테고리를 번갈아 골라 한 카테고리에 몰리지 않는다', () => {
        const result = selectDiverseFallback(TOOLS, 4);

        expect(new Set(result.map((item) => item.tool.category)).size).toBeGreaterThan(1);
    });

    it('도구 수보다 많이 요청해도 전체 개수를 넘지 않는다', () => {
        expect(selectDiverseFallback(TOOLS, 100).length).toBe(TOOLS.length);
    });

    it('사유 없이 도구만 담는다 (개인화 근거가 없는 목록이므로)', () => {
        expect(selectDiverseFallback(TOOLS, 2).every((item) => item.reasons.length === 0)).toBe(true);
    });
});

describe('recommendFeatured', () => {
    it('개인화 신호가 없으면 카테고리가 섞인 목록을 준다', () => {
        const result = recommendFeatured(TOOLS, 3);

        expect(result.length).toBe(3);
        expect(new Set(result.map((item) => item.tool.category)).size).toBeGreaterThan(1);
    });

    it('seed 자신은 감점되어 뒤로 밀린다', () => {
        const result = recommendFeatured(TOOLS, 3, { favorites: ['b'] });
        const seed = result.find((item) => item.tool.id === 'b');

        // 감점되더라도 후보가 부족하면 목록에 남을 수 있다. 다만 최상위는 아니다.
        if (seed) expect(result[0].tool.id).not.toBe('b');
    });

    it('존재하지 않는 seed 만 있으면 기본 목록으로 폴백한다', () => {
        const result = recommendFeatured(TOOLS, 2, { favorites: ['없는도구'] });

        expect(result.length).toBe(2);
    });

    it('개인화 결과가 모자라면 기본 목록으로 limit 을 채운다', () => {
        const result = recommendFeatured(TOOLS, 4, { favorites: ['a'] });

        expect(result.length).toBe(4);
    });

    it('최근 사용 도구를 seed 로 쓴다', () => {
        const result = recommendFeatured(TOOLS, 3, {
            usage: { a: { count: 3, lastUsedAt: NOW } },
            now: NOW,
        });

        expect(result.length).toBe(3);
    });

    it('실제 카탈로그에서 요청 개수를 정확히 채운다', () => {
        expect(recommendFeatured(allTools, 10).length).toBe(10);
    });
});
