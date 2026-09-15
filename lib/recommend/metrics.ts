/**
 * 추천 효과 측정 (로컬 전용).
 *
 * 노출(impression)과 클릭(click)만 센다. 서버로 보내지 않으므로
 * 개인정보 처리 없이 "추천이 실제로 눌리는가"를 기기 단위로 확인할 수 있다.
 *
 * 목적이 두 가지라 저장소를 분리했다:
 *  - 사용 기록(`toolUsage`)은 추천 **입력**이다.
 *  - 측정값(`recommendMetrics`)은 추천 **출력의 성과**다.
 * 섞으면 측정값이 다시 추천에 영향을 줘 순환이 생긴다.
 */

export type MetricRecord = {
    /** 추천 목록에 노출된 횟수 */
    impressions: number;
    /** 노출된 카드를 클릭한 횟수 */
    clicks: number;
};

export type MetricsMap = Record<string, MetricRecord>;

export const METRICS_STORAGE_KEY = 'recommendMetrics';

/**
 * 보관할 도구 수 상한.
 * 측정값은 분석용이라 오래된 항목이 쌓여도 이득이 없고,
 * localStorage 용량만 차지한다.
 */
const MAX_METRIC_ENTRIES = 60;

function hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** 저장된 측정값을 읽는다. 손상된 항목은 버린다. */
export function readMetrics(): MetricsMap {
    if (!hasStorage()) return {};

    try {
        const raw = window.localStorage.getItem(METRICS_STORAGE_KEY);
        if (!raw) return {};

        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

        const result: MetricsMap = {};
        for (const [toolId, value] of Object.entries(parsed as Record<string, unknown>)) {
            if (!value || typeof value !== 'object') continue;

            const record = value as Partial<MetricRecord>;
            const impressions = toCount(record.impressions);
            const clicks = toCount(record.clicks);

            // 둘 다 0 이면 담을 이유가 없다.
            if (impressions === 0 && clicks === 0) continue;
            result[toolId] = { impressions, clicks };
        }

        return result;
    } catch {
        return {};
    }
}

/** 음수·NaN·소수를 0 이상의 정수로 정규화한다. */
function toCount(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0;
    return Math.floor(value);
}

/** 측정값을 저장한다. 실패 시 false (측정은 부가 기능이므로 조용히 포기한다). */
export function writeMetrics(metrics: MetricsMap): boolean {
    if (!hasStorage()) return false;

    try {
        // 클릭이 많은 항목부터 남긴다. 상한을 넘으면 성과가 낮은 항목을 버린다.
        const trimmed: MetricsMap = {};
        for (const [toolId, record] of Object.entries(metrics)
            .sort(([, a], [, b]) => b.clicks - a.clicks || b.impressions - a.impressions)
            .slice(0, MAX_METRIC_ENTRIES)) {
            trimmed[toolId] = record;
        }

        window.localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(trimmed));
        return true;
    } catch {
        return false;
    }
}

/**
 * 노출을 기록한다.
 *
 * 같은 도구가 한 화면에 두 번 나오면 두 번 세지 않는다.
 * 호출부가 중복을 걸러야 하는 부담을 없애기 위해 여기서 id 를 한 번만 처리한다.
 */
export function recordImpressions(toolIds: string[]): MetricsMap {
    const metrics = readMetrics();

    for (const toolId of new Set(toolIds)) {
        const record = metrics[toolId] ?? { impressions: 0, clicks: 0 };
        record.impressions += 1;
        metrics[toolId] = record;
    }

    writeMetrics(metrics);
    return metrics;
}

/** 클릭을 기록한다. 노출보다 클릭이 많아지면(=노출 집계 누락) 노출도 함께 올려 CTR 이 1 을 넘지 않게 한다. */
export function recordClick(toolId: string): MetricsMap {
    const metrics = readMetrics();
    const record = metrics[toolId] ?? { impressions: 0, clicks: 0 };

    record.clicks += 1;
    if (record.impressions < record.clicks) record.impressions = record.clicks;

    metrics[toolId] = record;
    writeMetrics(metrics);
    return metrics;
}

/** 클릭률 (0~1). 노출이 0이면 정의되지 않으므로 0 으로 둔다. */
export function getClickThroughRate(record: MetricRecord): number {
    if (record.impressions <= 0) return 0;
    return record.clicks / record.impressions;
}

export type MetricsSummary = {
    /** 전체 노출 합계 */
    impressions: number;
    /** 전체 클릭 합계 */
    clicks: number;
    /** 전체 클릭률 */
    clickThroughRate: number;
    /** 클릭이 많은 순 상위 항목 */
    topClicked: Array<{ toolId: string; clicks: number; clickThroughRate: number }>;
};

/** 화면에 요약을 보여주거나 테스트에서 확인할 때 쓴다. */
export function summarizeMetrics(metrics: MetricsMap, topN = 5): MetricsSummary {
    const entries = Object.entries(metrics);

    let impressions = 0;
    let clicks = 0;
    for (const [, record] of entries) {
        impressions += record.impressions;
        clicks += record.clicks;
    }

    const topClicked = entries
        .map(([toolId, record]) => ({
            toolId,
            clicks: record.clicks,
            clickThroughRate: getClickThroughRate(record),
        }))
        .sort((a, b) => b.clicks - a.clicks || a.toolId.localeCompare(b.toolId))
        .slice(0, topN);

    return {
        impressions,
        clicks,
        clickThroughRate: impressions > 0 ? clicks / impressions : 0,
        topClicked,
    };
}

/** 한 번이라도 노출된 도구 id. 랭커의 demoteIds 로 넘겨 반복 노출을 눌러준다. */
export function getImpressedToolIds(metrics: MetricsMap): string[] {
    return Object.entries(metrics)
        .filter(([, record]) => record.impressions > 0)
        .map(([toolId]) => toolId);
}

/** 측정값 전체 삭제. 설정 화면이나 디버깅에서 쓴다. */
export function clearMetrics(): boolean {
    if (!hasStorage()) return false;

    try {
        window.localStorage.removeItem(METRICS_STORAGE_KEY);
        return true;
    } catch {
        return false;
    }
}
