import type { Integration } from '@/app/data/types';
import { allTools } from '@/app/data/integrations';
import { MATCH_WEIGHTS, SEARCH_PERSONALIZATION_SCALE, searchTools } from '@/lib/recommend/search';
import { SIGNAL_WEIGHTS } from '@/lib/recommend/weights';

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
    makeTool({
        id: 'json-formatter',
        name: 'JSON 포매터',
        description: 'JSON 데이터를 정리합니다',
        category: '텍스트 처리',
        tags: ['JSON', '포매팅'],
    }),
    makeTool({
        id: 'csv-json',
        name: 'CSV to JSON',
        description: 'CSV 를 JSON 으로 바꿉니다',
        category: '텍스트 처리',
        tags: ['CSV', 'JSON'],
    }),
    makeTool({
        id: 'jwt-decoder',
        name: 'JWT 디코더',
        description: 'JSON 웹 토큰을 해석합니다',
        category: '보안',
        tags: ['JWT', '토큰'],
    }),
    makeTool({
        id: 'hash-tool',
        name: '해시 계산기',
        description: '해시를 계산합니다',
        category: '보안',
        tags: ['해시'],
    }),
];

const ids = (hits: { tool: Integration }[]) => hits.map((hit) => hit.tool.id);

describe('searchTools — 필터링', () => {
    it('빈 검색어는 빈 배열을 준다 (전체 목록은 호출부의 정렬 옵션 몫)', () => {
        expect(searchTools(TOOLS, '')).toEqual([]);
    });

    it('공백만 있는 검색어도 빈 배열을 준다', () => {
        expect(searchTools(TOOLS, '   ')).toEqual([]);
    });

    it('걸리는 도구가 없으면 빈 배열을 준다', () => {
        expect(searchTools(TOOLS, 'zzzz없는단어')).toEqual([]);
    });

    it('이름이 걸린 도구만 결과에 남는다', () => {
        expect(ids(searchTools(TOOLS, '해시'))).toEqual(['hash-tool']);
    });
});

describe('searchTools — 관련도 순위', () => {
    it('이름이 걸린 도구가 설명만 걸린 도구보다 앞선다', () => {
        const result = ids(searchTools(TOOLS, 'json'));

        // json-formatter 는 이름 접두, csv-json 은 이름 부분, jwt-decoder 는 설명만.
        expect(result[0]).toBe('json-formatter');
        expect(result.indexOf('csv-json')).toBeLessThan(result.indexOf('jwt-decoder'));
    });

    it('이름 정확 일치가 접두 일치보다 높다', () => {
        const tools = [
            makeTool({ id: 'exact', name: 'json' }),
            makeTool({ id: 'prefix', name: 'json 도구' }),
        ];

        expect(ids(searchTools(tools, 'json'))).toEqual(['exact', 'prefix']);
    });

    it('태그로만 걸리는 도구도 찾는다', () => {
        const result = searchTools(TOOLS, '포매팅');

        expect(ids(result)).toEqual(['json-formatter']);
        expect(result[0].matchedFields).toContain('tag');
    });

    it('카테고리로 걸리는 도구를 찾는다', () => {
        expect(ids(searchTools(TOOLS, '보안')).sort()).toEqual(['hash-tool', 'jwt-decoder']);
    });

    it('여러 단어로 검색하면 단어별 점수가 합산된다', () => {
        const result = ids(searchTools(TOOLS, 'csv json'));

        expect(result[0]).toBe('csv-json');
    });

    it('matchedFields 에 걸린 필드를 남긴다', () => {
        const hit = searchTools(TOOLS, 'json').find((item) => item.tool.id === 'json-formatter');

        expect(hit?.matchedFields).toContain('name');
        expect(hit?.matchedFields).toContain('tag');
    });

    it('같은 입력에 항상 같은 순서를 준다', () => {
        expect(ids(searchTools(TOOLS, 'json'))).toEqual(ids(searchTools(TOOLS, 'json')));
    });
});

describe('searchTools — 개인화', () => {
    it('즐겨찾기 도구가 동점 후보를 앞선다', () => {
        const plain = ids(searchTools(TOOLS, '보안'));
        const personalized = ids(searchTools(TOOLS, '보안', { favorites: ['hash-tool'] }));

        // 점수 차이가 실제로 발생해야 하므로 동점 정렬에 의존하지 않는다.
        expect(personalized[0]).toBe('hash-tool');
        expect(plain).toHaveLength(2);
    });

    it('최근 사용 기록이 순위에 반영된다', () => {
        const hit = searchTools(TOOLS, '보안', {
            usage: { 'hash-tool': { count: 5, lastUsedAt: NOW } },
            now: NOW,
        }).find((item) => item.tool.id === 'hash-tool');

        // 카테고리 점수 + 사용 점수(가중치 × 개인화 계수)
        expect(hit!.score).toBeCloseTo(
            MATCH_WEIGHTS.categoryExact + SIGNAL_WEIGHTS.recentUsage * SEARCH_PERSONALIZATION_SCALE,
            6
        );
    });

    it('개인화 비중이 추천보다 낮다 (검색어 의도를 흐리지 않기 위해)', () => {
        expect(SEARCH_PERSONALIZATION_SCALE).toBeLessThan(1);
    });

    it('기간이 지난 사용 기록은 순위에 영향을 주지 않는다', () => {
        const hit = searchTools(TOOLS, '보안', {
            usage: { 'hash-tool': { count: 5, lastUsedAt: NOW - 400 * 24 * 60 * 60 * 1000 } },
            now: NOW,
        }).find((item) => item.tool.id === 'hash-tool');

        expect(hit!.score).toBeCloseTo(MATCH_WEIGHTS.categoryExact, 6);
    });
});

describe('searchTools — 실제 카탈로그', () => {
    it('json 검색의 1위가 JSON 포매터다', () => {
        expect(searchTools(allTools, 'json')[0].tool.id).toBe('json-formatter');
    });

    it('base64 검색의 1위가 Base64 도구다', () => {
        expect(searchTools(allTools, 'base64')[0].tool.id).toBe('base64');
    });

    it('모든 결과의 점수가 0보다 크다', () => {
        expect(searchTools(allTools, 'json').every((hit) => hit.score > 0)).toBe(true);
    });

    it('검색 결과는 전체 도구보다 적다 (필터가 동작한다)', () => {
        expect(searchTools(allTools, 'json').length).toBeLessThan(allTools.length);
    });
});
