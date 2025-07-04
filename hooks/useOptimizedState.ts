import { useState, useCallback, useRef, useEffect } from 'react';

// 디바운스된 값을 반환하는 훅
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// 최적화된 상태 관리 훅
export function useOptimizedState<T>(initialValue: T) {
    const [state, setState] = useState<T>(initialValue);
    const stateRef = useRef<T>(initialValue);

    const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
        setState((prev) => {
            const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
            stateRef.current = nextValue;
            return nextValue;
        });
    }, []);

    const getState = useCallback(() => stateRef.current, []);

    return [state, optimizedSetState, getState] as const;
}

// 로컬 스토리지와 동기화된 상태 훅
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue] as const;
}

// 이전 값을 기억하는 훅
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

// 메모이제이션된 콜백 훅
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
    const callbackRef = useRef<T>(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        ((...args: unknown[]) => {
            return callbackRef.current(...args);
        }) as T,
        []
    );
}

// 최적화된 객체 비교 훅
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
    const ref = useRef<{ deps: React.DependencyList; value: T } | undefined>(undefined);

    if (!ref.current || !areEqual(ref.current.deps, deps)) {
        ref.current = {
            deps,
            value: factory(),
        };
    }

    return ref.current.value;
}

// 깊은 비교 함수
function areEqual(a: React.DependencyList, b: React.DependencyList): boolean {
    if (a.length !== b.length) return false;
    return a.every((item, index) => Object.is(item, b[index]));
}
