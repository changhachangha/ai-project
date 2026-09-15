import { renderHook, act } from '@testing-library/react';

import {
    FAVORITES_STORAGE_KEY,
    readFavorites,
    useFavorites,
    writeFavorites,
} from '@/hooks/useFavorites';

beforeEach(() => {
    window.localStorage.clear();
});

describe('readFavorites / writeFavorites', () => {
    it('저장된 값이 없으면 빈 배열을 준다', () => {
        expect(readFavorites()).toEqual([]);
    });

    it('저장한 값을 그대로 읽는다', () => {
        writeFavorites(['base64', 'hash-tool']);

        expect(readFavorites()).toEqual(['base64', 'hash-tool']);
    });

    it('깨진 JSON 이면 예외 없이 빈 배열을 준다', () => {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, '{ 깨진');

        expect(readFavorites()).toEqual([]);
    });

    it('배열이 아니면 빈 배열을 준다', () => {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ a: 1 }));

        expect(readFavorites()).toEqual([]);
    });

    it('문자열이 아닌 항목은 버린다', () => {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['base64', 1, null, 'hash-tool']));

        expect(readFavorites()).toEqual(['base64', 'hash-tool']);
    });
});

describe('useFavorites', () => {
    it('마운트 시 저장된 즐겨찾기를 불러온다', () => {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['base64']));

        const { result } = renderHook(() => useFavorites());

        expect(result.current.favorites).toEqual(['base64']);
    });

    it('마운트만으로는 저장소를 덮어쓰지 않는다', () => {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['base64']));

        renderHook(() => useFavorites());

        expect(readFavorites()).toEqual(['base64']);
    });

    it('toggle 로 추가하면 저장소에도 반영된다', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggle('base64');
        });

        expect(result.current.favorites).toEqual(['base64']);
        expect(readFavorites()).toEqual(['base64']);
    });

    it('toggle 로 제거한다', () => {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['base64']));

        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggle('base64');
        });

        expect(result.current.favorites).toEqual([]);
        expect(readFavorites()).toEqual([]);
    });

    it('isFavorite 로 포함 여부를 확인한다', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggle('base64');
        });

        expect(result.current.isFavorite('base64')).toBe(true);
        expect(result.current.isFavorite('hash-tool')).toBe(false);
    });

    it('저장이 차단돼도 상태는 정상 동작한다', () => {
        const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });

        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggle('base64');
        });

        expect(result.current.favorites).toEqual(['base64']);

        setItem.mockRestore();
    });
});
