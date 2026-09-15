'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * 즐겨찾기 저장소 키.
 *
 * 홈/목록 화면(`HomePageClient`, `integrations/page.tsx`)이 이미 이 키를 쓰고 있다.
 * 키를 바꾸면 기존 사용자의 즐겨찾기가 사라지므로 값을 그대로 유지한다.
 */
export const FAVORITES_STORAGE_KEY = 'favoriteIntegrations';

/** localStorage 를 쓸 수 있는 환경인지. 서버 렌더링 중에는 window 가 없다. */
function hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * 저장된 즐겨찾기를 읽는다.
 * 값이 깨져 있어도 예외를 던지지 않는다. 즐겨찾기는 부가 기능이라
 * 읽기에 실패하면 "즐겨찾기 없음"으로 보고 추천은 비개인화로 돌아가면 된다.
 */
export function readFavorites(): string[] {
    if (!hasStorage()) return [];

    try {
        const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        // 문자열이 아닌 항목은 버린다. 추천 계산에서 id 비교만 하므로 타입이 맞아야 한다.
        return parsed.filter((value): value is string => typeof value === 'string');
    } catch {
        return [];
    }
}

/** 즐겨찾기를 저장한다. 저장 실패(용량 초과·권한 차단) 시 false. */
export function writeFavorites(ids: string[]): boolean {
    if (!hasStorage()) return false;

    try {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
        return true;
    } catch {
        return false;
    }
}

/**
 * 즐겨찾기 훅.
 *
 * 도구 페이지(47개)는 즐겨찾기를 켜고 끄는 UI 가 없고, 추천 신호로만 쓴다.
 * 그래서 이 훅은 "읽기"를 기본으로 하고 쓰기는 toggle 을 호출했을 때만 한다.
 * (마운트 시 저장을 하면 아직 읽지 않은 빈 배열로 기존 값을 덮어쓴다)
 */
export function useFavorites() {
    // 초기값을 빈 배열로 두면 서버/클라이언트 첫 렌더가 일치해 하이드레이션 불일치가 없다.
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        setFavorites(readFavorites());
    }, []);

    const toggle = useCallback((toolId: string) => {
        setFavorites((prev) => {
            const next = prev.includes(toolId)
                ? prev.filter((id) => id !== toolId)
                : [...prev, toolId];

            writeFavorites(next);
            return next;
        });
    }, []);

    const isFavorite = useCallback((toolId: string) => favorites.includes(toolId), [favorites]);

    return { favorites, toggle, isFavorite };
}

export default useFavorites;
