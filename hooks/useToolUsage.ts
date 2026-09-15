'use client';

import { useCallback, useEffect, useState } from 'react';

import { UsageMap, clearUsage, readUsage, recordUsage } from '@/lib/recommend';

/**
 * 도구 사용 기록 훅.
 *
 * 이 훅을 호출한 도구 페이지가 열릴 때 방문을 한 번 기록한다.
 * 서버 전송은 없고 localStorage 만 쓴다.
 *
 * 저장소 접근이 실패해도 화면은 정상 동작해야 하므로, 실패는 조용히 삼키고
 * 빈 맵으로 시작한다(추천은 개인화 없이 기본 동작).
 */
export function useToolUsage(toolId: string) {
    // 초기값을 빈 객체로 두면 서버/클라이언트 첫 렌더 결과가 일치해 하이드레이션 불일치가 없다.
    // 저장소 값은 effect 에서 읽는다.
    const [usage, setUsage] = useState<UsageMap>({});

    useEffect(() => {
        setUsage(recordUsage(toolId));
    }, [toolId]);

    const clear = useCallback(() => {
        clearUsage();
        setUsage(readUsage());
    }, []);

    return {
        usage,
        clear,
    };
}

export default useToolUsage;
