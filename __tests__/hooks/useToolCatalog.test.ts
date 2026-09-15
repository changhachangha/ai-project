import { act, renderHook } from '@testing-library/react';

import { allTools } from '@/app/data/integrations';
import { encodingTools } from '@/app/data/encoding-tools';
import { FAVORITES_STORAGE_KEY, readFavorites } from '@/hooks/useFavorites';
import { USAGE_STORAGE_KEY } from '@/lib/recommend/usage';
import { useToolCatalog } from '@/hooks/useToolCatalog';

beforeEach(() => {
    window.localStorage.clear();
});

const renderCatalog = (options?: Partial<Parameters<typeof useToolCatalog>[0]>) =>
    renderHook((props) => useToolCatalog({ tools: allTools, ...options, ...props }), {
        initialProps: options ?? {},
    });

describe('useToolCatalog', () => {
    it('기본값: 빈 검색어, 이름 오름차순, 즐겨찾기 없음', () => {
        const { result } = renderCatalog();

        expect(result.current.query).toBe('');
        expect(result.current.favorites).toEqual([]);
        const names = result.current.visibleTools.map((tool) => tool.name);
        expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });

    it('마운트만으로는 즐겨찾기 저장소를 덮어쓰지 않는다', () => {
        // 이전 복제본은 읽기 전에 '[]' 를 저장해 매 마운트마다 즐겨찾기가 날아갔다.
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['base64']));
        const setItem = jest.spyOn(Storage.prototype, 'setItem');

        renderCatalog();

        const writesToFavorites = setItem.mock.calls.filter(([key]) => key === FAVORITES_STORAGE_KEY);
        expect(writesToFavorites).toEqual([]);
        expect(readFavorites()).toEqual(['base64']);

        setItem.mockRestore();
    });

    it('toggleFavorite 로 추가/제거하고 저장소에 반영한다', () => {
        const { result } = renderCatalog();

        act(() => result.current.toggleFavorite('base64'));
        expect(result.current.favorites).toEqual(['base64']);
        expect(readFavorites()).toEqual(['base64']);

        act(() => result.current.toggleFavorite('base64'));
        expect(result.current.favorites).toEqual([]);
    });

    it('마운트 시 사용 기록을 읽는다', () => {
        window.localStorage.setItem(
            USAGE_STORAGE_KEY,
            JSON.stringify({ base64: { count: 3, lastUsedAt: Date.now() } })
        );

        const { result } = renderCatalog();

        expect(result.current.usage.base64?.count).toBe(3);
    });

    it('검색어가 있으면 관련도 순으로 정렬한다', () => {
        const { result } = renderCatalog();

        act(() => result.current.setQuery('base64'));

        expect(result.current.visibleTools.length).toBeGreaterThan(0);
        expect(result.current.visibleTools[0].id).toBe('base64');
    });

    it('없는 검색어는 빈 목록을 준다', () => {
        const { result } = renderCatalog();

        act(() => result.current.setQuery('zzz-no-such-tool-zzz'));

        expect(result.current.visibleTools).toEqual([]);
    });

    it('정렬 옵션이 적용되고 검색 중에는 무시된다', () => {
        const { result } = renderCatalog();

        act(() => result.current.setSortOption('name-desc'));
        const names = result.current.visibleTools.map((tool) => tool.name);
        expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));

        act(() => result.current.setQuery('base64'));
        // 검색 중에는 정렬 옵션이 아니라 관련도가 순서를 정한다.
        expect(result.current.visibleTools[0].id).toBe('base64');
    });

    it('카테고리는 데이터에서 파생한다 — 하드코딩 목록의 누락이 없다', () => {
        // 회귀: encoding 페이지의 수기 목록은 '특수 인코딩' 을 빼먹어
        // morse-code/caesar-cipher 가 필터에서 도달 불가였다.
        const { result } = renderCatalog({ tools: encodingTools });

        expect(result.current.categories).toContain('특수 인코딩');

        act(() => result.current.setCategory('특수 인코딩'));
        expect(result.current.visibleTools.map((tool) => tool.id).sort()).toEqual([
            'caesar-cipher',
            'morse-code',
        ]);
    });

    it('외부 category 옵션이 내부 상태를 대신한다', () => {
        const category = '텍스트 처리';
        const { result, rerender } = renderCatalog({ category });

        expect(result.current.visibleTools.every((tool) => tool.category === '텍스트 처리')).toBe(true);

        rerender({ category: '보안/암호화' });
        expect(result.current.visibleTools.every((tool) => tool.category === '보안/암호화')).toBe(true);
    });

    it('favoriteTools 는 저장된 즐겨찾기를 반영한다', () => {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['base64', 'hash-tool']));

        const { result } = renderCatalog();

        expect(result.current.favoriteTools.map((tool) => tool.id).sort()).toEqual(['base64', 'hash-tool']);
    });

    it('featured 는 신호가 없으면 라운드로빈으로 limit 만큼 채운다', () => {
        const { result } = renderCatalog({ featuredLimit: 10 });

        expect(result.current.featuredTools).toHaveLength(10);
        // 카테고리가 한 곳에 몰리지 않는다.
        expect(new Set(result.current.featuredTools.map((tool) => tool.category)).size).toBeGreaterThan(1);
    });

    it('깨진 즐겨찾기 JSON 도 예외 없이 빈 목록으로 동작한다', () => {
        // 회귀: 이전 복제본은 JSON.parse 를 그대로 호출해 손상 시 크래시 루프였다.
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, '{ 깨진');

        const { result } = renderCatalog();

        expect(result.current.favorites).toEqual([]);
        expect(result.current.favoriteTools).toEqual([]);
    });
});
