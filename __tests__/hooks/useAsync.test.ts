import { renderHook, act } from '@testing-library/react';
import { useAsync } from '@/hooks/useAsync';

// Mock async function
const mockAsyncFunction = jest.fn();

describe('useAsync', () => {
    beforeEach(() => {
        mockAsyncFunction.mockClear();
    });

    it('초기 상태가 올바르게 설정됨', () => {
        const { result } = renderHook(() => useAsync(mockAsyncFunction));

        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('성공적인 비동기 작업 처리', async () => {
        const mockData = { message: 'success' };
        mockAsyncFunction.mockResolvedValue(mockData);

        const { result } = renderHook(() => useAsync(mockAsyncFunction));

        await act(async () => {
            await result.current.execute();
        });

        expect(result.current.data).toEqual(mockData);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('실패한 비동기 작업 처리', async () => {
        const mockError = new Error('Test error');
        mockAsyncFunction.mockRejectedValue(mockError);

        const { result } = renderHook(() => useAsync(mockAsyncFunction));

        await act(async () => {
            try {
                await result.current.execute();
            } catch {
                // Expected to throw
            }
        });

        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toEqual(mockError);
    });

    it('로딩 상태가 올바르게 관리됨', async () => {
        let resolvePromise: (value: unknown) => void;
        const promise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        mockAsyncFunction.mockReturnValue(promise);

        const { result } = renderHook(() => useAsync(mockAsyncFunction));

        act(() => {
            result.current.execute();
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            resolvePromise('success');
            await promise;
        });

        expect(result.current.loading).toBe(false);
    });

    it('reset 함수가 상태를 초기화함', async () => {
        const mockData = { message: 'success' };
        mockAsyncFunction.mockResolvedValue(mockData);

        const { result } = renderHook(() => useAsync(mockAsyncFunction));

        await act(async () => {
            await result.current.execute();
        });

        expect(result.current.data).toEqual(mockData);

        act(() => {
            result.current.reset();
        });

        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });
});
