import {
    METRICS_STORAGE_KEY,
    clearMetrics,
    getClickThroughRate,
    readMetrics,
    recordClick,
    recordImpressions,
    summarizeMetrics,
    writeMetrics,
} from '@/lib/recommend/metrics';

beforeEach(() => {
    window.localStorage.clear();
});

describe('readMetrics', () => {
    it('저장된 값이 없으면 빈 객체를 준다', () => {
        expect(readMetrics()).toEqual({});
    });

    it('저장된 값을 그대로 읽는다', () => {
        window.localStorage.setItem(
            METRICS_STORAGE_KEY,
            JSON.stringify({ 'hash-tool': { impressions: 4, clicks: 1 } })
        );

        expect(readMetrics()).toEqual({ 'hash-tool': { impressions: 4, clicks: 1 } });
    });

    it('깨진 JSON 이면 예외 없이 빈 객체를 준다', () => {
        window.localStorage.setItem(METRICS_STORAGE_KEY, '{ 깨진');

        expect(readMetrics()).toEqual({});
    });

    it('배열이 저장돼 있으면 빈 객체를 준다', () => {
        window.localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify([1, 2, 3]));

        expect(readMetrics()).toEqual({});
    });

    it('잘못된 항목은 버린다', () => {
        window.localStorage.setItem(
            METRICS_STORAGE_KEY,
            JSON.stringify({
                good: { impressions: 2, clicks: 1 },
                negative: { impressions: -1, clicks: 0 },
                nan: { impressions: 'x', clicks: null },
                empty: { impressions: 0, clicks: 0 },
                notObject: 'nope',
            })
        );

        expect(readMetrics()).toEqual({ good: { impressions: 2, clicks: 1 } });
    });

    it('소수는 내림해 정수로 정규화한다', () => {
        window.localStorage.setItem(
            METRICS_STORAGE_KEY,
            JSON.stringify({ a: { impressions: 2.9, clicks: 1.2 } })
        );

        expect(readMetrics()).toEqual({ a: { impressions: 2, clicks: 1 } });
    });
});

describe('recordImpressions', () => {
    it('노출을 누적한다', () => {
        recordImpressions(['a']);
        recordImpressions(['a']);

        expect(readMetrics().a).toEqual({ impressions: 2, clicks: 0 });
    });

    it('한 번의 호출에 같은 id 가 중복돼도 한 번만 센다', () => {
        recordImpressions(['a', 'a', 'a']);

        expect(readMetrics().a.impressions).toBe(1);
    });

    it('여러 도구를 함께 기록한다', () => {
        recordImpressions(['a', 'b']);

        expect(Object.keys(readMetrics()).sort()).toEqual(['a', 'b']);
    });

    it('저장 실패가 예외로 새어 나오지 않는다', () => {
        const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });

        expect(() => recordImpressions(['a'])).not.toThrow();

        setItem.mockRestore();
    });
});

describe('recordClick', () => {
    it('클릭을 누적한다', () => {
        recordImpressions(['a']);
        recordClick('a');

        expect(readMetrics().a).toEqual({ impressions: 1, clicks: 1 });
    });

    it('노출 없이 클릭만 기록되면 노출도 함께 올려 CTR 이 1 을 넘지 않게 한다', () => {
        recordClick('a');

        const record = readMetrics().a;
        expect(record).toEqual({ impressions: 1, clicks: 1 });
        expect(getClickThroughRate(record)).toBeLessThanOrEqual(1);
    });
});

describe('writeMetrics', () => {
    it('상한을 넘는 항목은 클릭이 많은 순으로 남긴다', () => {
        const many: Record<string, { impressions: number; clicks: number }> = {};
        for (let i = 0; i < 70; i += 1) {
            many[`tool-${i}`] = { impressions: 10, clicks: i };
        }

        writeMetrics(many);
        const stored = readMetrics();

        expect(Object.keys(stored)).toHaveLength(60);
        // 클릭이 가장 많은 항목은 살아남는다.
        expect(stored['tool-69']).toEqual({ impressions: 10, clicks: 69 });
        // 클릭이 가장 적은 항목은 버려진다.
        expect(stored['tool-0']).toBeUndefined();
    });
});

describe('getClickThroughRate', () => {
    it('노출이 0 이면 0 을 준다', () => {
        expect(getClickThroughRate({ impressions: 0, clicks: 0 })).toBe(0);
    });

    it('클릭/노출 비율을 준다', () => {
        expect(getClickThroughRate({ impressions: 4, clicks: 1 })).toBeCloseTo(0.25, 6);
    });
});

describe('summarizeMetrics', () => {
    it('합계와 클릭률을 계산한다', () => {
        const summary = summarizeMetrics({
            a: { impressions: 10, clicks: 2 },
            b: { impressions: 10, clicks: 0 },
        });

        expect(summary.impressions).toBe(20);
        expect(summary.clicks).toBe(2);
        expect(summary.clickThroughRate).toBeCloseTo(0.1, 6);
    });

    it('클릭이 많은 순으로 상위 항목을 준다', () => {
        const summary = summarizeMetrics({
            a: { impressions: 10, clicks: 1 },
            b: { impressions: 10, clicks: 5 },
        });

        expect(summary.topClicked[0].toolId).toBe('b');
    });

    it('비어 있으면 0 으로 요약한다', () => {
        expect(summarizeMetrics({})).toEqual({
            impressions: 0,
            clicks: 0,
            clickThroughRate: 0,
            topClicked: [],
        });
    });
});

describe('clearMetrics', () => {
    it('저장된 측정값을 지운다', () => {
        recordImpressions(['a']);

        expect(clearMetrics()).toBe(true);
        expect(readMetrics()).toEqual({});
    });
});
