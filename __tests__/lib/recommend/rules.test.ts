import type { Integration } from '@/app/data/types';
import {
    applyDiversity,
    buildRelatedMap,
    countTagOverlap,
    scoreByRules,
    sortScored,
} from '@/lib/recommend/rules';
import { MAX_PER_CATEGORY } from '@/lib/recommend/weights';

/** 테스트용 최소 도구. 아이콘은 렌더하지 않으므로 더미 함수로 충분하다. */
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
    makeTool({ id: 'a', category: '인코딩', tags: ['인코딩', '문자열'], related: ['b'] }),
    makeTool({ id: 'b', category: '인코딩', tags: ['인코딩', '문자열'] }),
    makeTool({ id: 'c', category: '인코딩', tags: ['인코딩'] }),
    makeTool({ id: 'd', category: '보안', tags: ['인코딩', '해시'] }),
    makeTool({ id: 'e', category: '텍스트', tags: ['텍스트'] }),
];

describe('buildRelatedMap', () => {
    it('단방향 선언을 양방향으로 확장한다', () => {
        const map = buildRelatedMap(TOOLS);

        expect(map.get('a')?.has('b')).toBe(true);
        expect(map.get('b')?.has('a')).toBe(true);
    });

    it('존재하지 않는 id 와 자기 자신은 무시한다', () => {
        const tools = [makeTool({ id: 'x', related: ['없는도구', 'x'] })];
        const map = buildRelatedMap(tools);

        expect(map.get('x')?.size).toBe(0);
    });
});

describe('countTagOverlap', () => {
    it('교집합 개수를 센다', () => {
        expect(countTagOverlap(TOOLS[0], TOOLS[1])).toBe(2);
        expect(countTagOverlap(TOOLS[0], TOOLS[2])).toBe(1);
        expect(countTagOverlap(TOOLS[0], TOOLS[4])).toBe(0);
    });
});

describe('scoreByRules', () => {
    it('자기 자신은 결과에서 제외한다', () => {
        const scored = scoreByRules('a', TOOLS);
        expect(scored.some((item) => item.tool.id === 'a')).toBe(false);
    });

    it('related 가 선언된 도구가 최상위 점수를 받는다', () => {
        const scored = sortScored(scoreByRules('a', TOOLS));
        expect(scored[0].tool.id).toBe('b');
        expect(scored[0].reasons).toContain('related');
    });

    it('태그 교집합 점수에 상한이 걸린다', () => {
        const manyTags = makeTool({ id: 'many', category: '보안', tags: ['인코딩', '문자열', '해시', '텍스트'] });
        const scored = scoreByRules('a', [TOOLS[0], manyTags]);
        const target = scored.find((item) => item.tool.id === 'many');

        // 교집합은 2개(인코딩, 문자열) → 상한 2 × 가중치 2.0 = 4.0
        expect(target?.breakdown['tag-overlap']).toBe(4);
    });

    it('점수가 0 이하인 도구는 결과에 넣지 않는다', () => {
        const unrelated = makeTool({ id: 'z', category: '기타', tags: ['무관'] });
        const scored = scoreByRules('a', [TOOLS[0], unrelated]);

        expect(scored.some((item) => item.tool.id === 'z')).toBe(false);
    });

    it('없는 도구 id 는 빈 배열을 반환한다', () => {
        expect(scoreByRules('없음', TOOLS)).toEqual([]);
    });
});

describe('sortScored', () => {
    it('동점이면 id 사전순으로 고정해 결과가 흔들리지 않는다', () => {
        const first = sortScored(scoreByRules('e', TOOLS)).map((item) => item.tool.id);
        const second = sortScored(scoreByRules('e', TOOLS)).map((item) => item.tool.id);

        expect(first).toEqual(second);
    });
});

describe('applyDiversity', () => {
    it('후보가 limit 보다 적으면 있는 만큼만 돌려준다', () => {
        const scored = sortScored(scoreByRules('a', TOOLS));
        const picked = applyDiversity(scored, 4);

        // a 와 점수가 겹치는 후보는 b, c, d 3개뿐이다 (e 는 태그가 겹치지 않아 제외).
        expect(scored.length).toBe(3);
        expect(picked.length).toBe(3);
    });

    it('같은 카테고리 후보가 많아도 최대 개수까지만 먼저 뽑는다', () => {
        // 인코딩 4개 + 보안 1개. 제한이 없으면 인코딩이 상위를 독식한다.
        const crowded = [
            makeTool({ id: 'src', category: '인코딩', tags: ['공통'] }),
            makeTool({ id: 'e1', category: '인코딩', tags: ['공통'] }),
            makeTool({ id: 'e2', category: '인코딩', tags: ['공통'] }),
            makeTool({ id: 'e3', category: '인코딩', tags: ['공통'] }),
            makeTool({ id: 'e4', category: '인코딩', tags: ['공통'] }),
            makeTool({ id: 's1', category: '보안', tags: ['공통'] }),
        ];

        const scored = sortScored(scoreByRules('src', crowded));
        const picked = applyDiversity(scored, 3);

        const encodingCount = picked.filter((item) => item.tool.category === '인코딩').length;
        expect(encodingCount).toBe(MAX_PER_CATEGORY);
        // 제한으로 밀린 인코딩 대신 보안 도구가 자리를 채운다.
        expect(picked.some((item) => item.tool.category === '보안')).toBe(true);
        expect(picked.length).toBe(3);
    });

    it('한 카테고리만 있으면 제한을 풀어 자리를 채운다', () => {
        const onlyEncoding = [
            makeTool({ id: 'p', category: '인코딩', tags: ['t'] }),
            makeTool({ id: 'q', category: '인코딩', tags: ['t'] }),
            makeTool({ id: 'r', category: '인코딩', tags: ['t'] }),
        ];
        const scored = sortScored(scoreByRules('p', onlyEncoding));
        const picked = applyDiversity(scored, 2);

        expect(picked.length).toBe(2);
    });
});
