import { RECENT_USAGE_WINDOW_MS } from './weights';

/**
 * 로컬 사용 기록.
 *
 * 서버로 보내지 않는다. 이 프로젝트는 전 라우트를 정적 프리렌더하기 때문에
 * 서버로 로그를 보내려면 별도 수집 경로와 저장소가 필요하고,
 * 개인정보 처리 부담도 생긴다. 기기별 개인화로 충분한 규모라 로컬에만 둔다.
 *
 * 즐겨찾기(favoriteIntegrations)와 저장소를 분리한 이유:
 * 즐겨찾기는 "관심 표시", 사용 기록은 "실제 사용"이라 신호의 성격이 다르다.
 * 한 키에 섞으면 나중에 가중치를 따로 조정할 수 없다.
 */
export type UsageRecord = {
    /** 서로 다른 방문으로 집계된 사용 횟수 */
    count: number;
    /** 마지막 사용 시각 (epoch ms) */
    lastUsedAt: number;
};

export type UsageMap = Record<string, UsageRecord>;

export const USAGE_STORAGE_KEY = 'toolUsage';

/**
 * 같은 도구를 이 간격 안에 다시 열면 새 방문으로 세지 않는다.
 * 개발 모드의 StrictMode 는 effect 를 두 번 실행하므로, 이 장치가 없으면
 * 모든 사용 횟수가 실제의 두 배로 쌓인다.
 */
export const USAGE_DEDUPE_MS = 60 * 1000;

/** localStorage 를 쓸 수 있는 환경인지. 서버 렌더링 중에는 window 가 없다. */
function hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * 저장된 사용 기록을 읽는다.
 * 시크릿 모드나 저장소 손상 시에도 예외를 던지지 않고 빈 객체를 준다.
 * 추천은 부가 기능이므로, 실패하면 개인화 없이 기본 추천으로 돌아가면 된다.
 */
export function readUsage(): UsageMap {
    if (!hasStorage()) return {};

    try {
        const raw = window.localStorage.getItem(USAGE_STORAGE_KEY);
        if (!raw) return {};

        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

        const result: UsageMap = {};
        for (const [toolId, value] of Object.entries(parsed as Record<string, unknown>)) {
            if (!value || typeof value !== 'object') continue;

            const record = value as Partial<UsageRecord>;
            const count = typeof record.count === 'number' && Number.isFinite(record.count) ? record.count : 0;
            const lastUsedAt =
                typeof record.lastUsedAt === 'number' && Number.isFinite(record.lastUsedAt)
                    ? record.lastUsedAt
                    : 0;

            // 손상된 항목은 버린다. 일부만 살리는 것보다 일관성이 낫다.
            if (count <= 0 || lastUsedAt <= 0) continue;
            result[toolId] = { count, lastUsedAt };
        }

        return result;
    } catch {
        return {};
    }
}

/** 사용 기록을 저장한다. 저장에 실패하면 false 를 준다(용량 초과·권한 차단). */
export function writeUsage(usage: UsageMap): boolean {
    if (!hasStorage()) return false;

    try {
        window.localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
        return true;
    } catch {
        return false;
    }
}

/**
 * 도구 사용을 기록하고 갱신된 맵을 돌려준다.
 *
 * 최근 사용 도구 개수는 무한정 늘리지 않는다. 오래 쓴 도구가 계속 상위에
 * 남아 추천이 굳는 것을 막기 위해 저장 시점에 잘라낸다.
 */
export function recordUsage(toolId: string, now: number = Date.now(), maxEntries = 30): UsageMap {
    const usage = readUsage();
    const previous = usage[toolId];

    const isNewVisit = !previous || now - previous.lastUsedAt >= USAGE_DEDUPE_MS;

    usage[toolId] = {
        count: isNewVisit ? (previous?.count ?? 0) + 1 : (previous?.count ?? 1),
        lastUsedAt: now,
    };

    // 최근 사용 순으로 정리하고 상한을 넘는 항목은 버린다.
    const trimmed: UsageMap = {};
    for (const [id, record] of Object.entries(usage)
        .sort(([, a], [, b]) => b.lastUsedAt - a.lastUsedAt)
        .slice(0, maxEntries)) {
        trimmed[id] = record;
    }

    writeUsage(trimmed);
    return trimmed;
}

/**
 * 개인화 점수 (0~1).
 * 빈도와 최근성을 섞는다. 빈도만 쓰면 예전에 많이 쓴 도구가 영원히 1위로 남고,
 * 최근성만 쓰면 한 번 열어 본 도구가 오래 쓴 도구를 앞지른다.
 */
export function getUsageScores(usage: UsageMap, now: number = Date.now()): Map<string, number> {
    const scores = new Map<string, number>();
    const entries = Object.entries(usage);

    const maxCount = entries.reduce((max, [, record]) => Math.max(max, record.count), 0);
    if (maxCount === 0) return scores;

    for (const [toolId, record] of entries) {
        const age = now - record.lastUsedAt;
        // 기간을 벗어난 기록은 개인화 신호로 쓰지 않는다.
        if (age < 0 || age > RECENT_USAGE_WINDOW_MS) continue;

        const frequency = record.count / maxCount;
        const recency = 1 - age / RECENT_USAGE_WINDOW_MS;

        scores.set(toolId, frequency * 0.6 + recency * 0.4);
    }

    return scores;
}

/** 최근 사용한 도구 id 목록. 홈 추천의 seed 로 쓴다. */
export function getRecentToolIds(usage: UsageMap, limit: number, now: number = Date.now()): string[] {
    return Object.entries(usage)
        .filter(([, record]) => now - record.lastUsedAt <= RECENT_USAGE_WINDOW_MS)
        .sort(([, a], [, b]) => b.lastUsedAt - a.lastUsedAt)
        .slice(0, limit)
        .map(([toolId]) => toolId);
}

/** 사용 기록 전체 삭제. 설정 화면이나 디버깅에서 쓴다. */
export function clearUsage(): boolean {
    if (!hasStorage()) return false;

    try {
        window.localStorage.removeItem(USAGE_STORAGE_KEY);
        return true;
    } catch {
        return false;
    }
}
