import {
    USAGE_DEDUPE_MS,
    USAGE_STORAGE_KEY,
    clearUsage,
    getRecentToolIds,
    getUsageScores,
    readUsage,
    recordUsage,
    writeUsage,
} from '@/lib/recommend/usage';
import { RECENT_USAGE_WINDOW_MS } from '@/lib/recommend/weights';

const NOW = new Date('2026-09-14T12:00:00Z').getTime();

beforeEach(() => {
    window.localStorage.clear();
});

describe('readUsage', () => {
    it('저장된 값이 없으면 빈 객체를 준다', () => {
        expect(readUsage()).toEqual({});
    });

    it('깨진 JSON 이면 빈 객체를 준다', () => {
        window.localStorage.setItem(USAGE_STORAGE_KEY, '{ this is not json');
        expect(readUsage()).toEqual({});
    });

    it('배열이나 원시값이 저장돼 있으면 빈 객체를 준다', () => {
        window.localStorage.setItem(USAGE_STORAGE_KEY, '[1,2,3]');
        expect(readUsage()).toEqual({});

        window.localStorage.setItem(USAGE_STORAGE_KEY, '"문자열"');
        expect(readUsage()).toEqual({});
    });

    it('형식이 어긋난 항목은 버리고 정상 항목만 남긴다', () => {
        window.localStorage.setItem(
            USAGE_STORAGE_KEY,
            JSON.stringify({
                good: { count: 3, lastUsedAt: NOW },
                zeroCount: { count: 0, lastUsedAt: NOW },
                noTimestamp: { count: 2, lastUsedAt: 0 },
                wrongType: 'not-an-object',
                missingFields: {},
            })
        );

        expect(readUsage()).toEqual({ good: { count: 3, lastUsedAt: NOW } });
    });
});

describe('writeUsage', () => {
    it('저장에 성공하면 true 를 준다', () => {
        expect(writeUsage({ a: { count: 1, lastUsedAt: NOW } })).toBe(true);
        expect(readUsage()).toEqual({ a: { count: 1, lastUsedAt: NOW } });
    });

    it('저장이 차단되면 예외 없이 false 를 준다', () => {
        // 시크릿 모드·용량 초과 상황을 흉내낸다.
        const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });

        expect(() => writeUsage({ a: { count: 1, lastUsedAt: NOW } })).not.toThrow();
        expect(writeUsage({ a: { count: 1, lastUsedAt: NOW } })).toBe(false);

        spy.mockRestore();
    });
});

describe('recordUsage', () => {
    it('처음 사용하면 횟수가 1 이 된다', () => {
        const usage = recordUsage('base64', NOW);

        expect(usage.base64).toEqual({ count: 1, lastUsedAt: NOW });
    });

    it('같은 도구를 간격 안에 다시 열면 횟수를 올리지 않는다', () => {
        recordUsage('base64', NOW);
        const usage = recordUsage('base64', NOW + USAGE_DEDUPE_MS - 1);

        expect(usage.base64.count).toBe(1);
        expect(usage.base64.lastUsedAt).toBe(NOW + USAGE_DEDUPE_MS - 1);
    });

    it('간격이 지나면 새 방문으로 센다', () => {
        recordUsage('base64', NOW);
        const usage = recordUsage('base64', NOW + USAGE_DEDUPE_MS);

        expect(usage.base64.count).toBe(2);
    });

    it('StrictMode 의 effect 중복 실행을 두 번으로 세지 않는다', () => {
        // 같은 시각에 두 번 호출되는 상황
        recordUsage('hash-tool', NOW);
        const usage = recordUsage('hash-tool', NOW);

        expect(usage['hash-tool'].count).toBe(1);
    });

    it('저장 항목 수를 상한으로 자른다', () => {
        let now = NOW;
        for (let i = 0; i < 40; i += 1) {
            recordUsage(`tool-${i}`, now);
            now += USAGE_DEDUPE_MS;
        }

        const usage = recordUsage('last', now, 5);
        expect(Object.keys(usage).length).toBe(5);
        // 가장 최근 것이 남는다.
        expect(usage.last).toBeDefined();
    });
});

describe('getUsageScores', () => {
    it('빈 기록에는 빈 맵을 준다', () => {
        expect(getUsageScores({}, NOW).size).toBe(0);
    });

    it('가장 많이 쓴 도구가 1 에 가까운 점수를 받는다', () => {
        const usage = {
            frequent: { count: 10, lastUsedAt: NOW },
            rare: { count: 1, lastUsedAt: NOW },
        };

        const scores = getUsageScores(usage, NOW);
        expect(scores.get('frequent')!).toBeGreaterThan(scores.get('rare')!);
        expect(scores.get('frequent')!).toBeLessThanOrEqual(1);
    });

    it('최근성도 반영해 같은 횟수면 최근 쓴 쪽이 높다', () => {
        const usage = {
            old: { count: 3, lastUsedAt: NOW - RECENT_USAGE_WINDOW_MS / 2 },
            recent: { count: 3, lastUsedAt: NOW },
        };

        const scores = getUsageScores(usage, NOW);
        expect(scores.get('recent')!).toBeGreaterThan(scores.get('old')!);
    });

    it('기간을 벗어난 기록은 제외한다', () => {
        const usage = {
            ancient: { count: 100, lastUsedAt: NOW - RECENT_USAGE_WINDOW_MS - 1 },
        };

        expect(getUsageScores(usage, NOW).size).toBe(0);
    });

    it('미래 시각이 기록돼 있으면 제외한다', () => {
        const usage = { broken: { count: 5, lastUsedAt: NOW + 1000 } };

        expect(getUsageScores(usage, NOW).size).toBe(0);
    });
});

describe('getRecentToolIds', () => {
    it('최근 사용 순으로 돌려준다', () => {
        const usage = {
            a: { count: 1, lastUsedAt: NOW - 3000 },
            b: { count: 1, lastUsedAt: NOW - 1000 },
            c: { count: 1, lastUsedAt: NOW - 2000 },
        };

        expect(getRecentToolIds(usage, 2, NOW)).toEqual(['b', 'c']);
    });

    it('기간을 벗어난 기록은 제외한다', () => {
        const usage = {
            old: { count: 1, lastUsedAt: NOW - RECENT_USAGE_WINDOW_MS - 1 },
            fresh: { count: 1, lastUsedAt: NOW },
        };

        expect(getRecentToolIds(usage, 5, NOW)).toEqual(['fresh']);
    });
});

describe('clearUsage', () => {
    it('저장된 기록을 지운다', () => {
        recordUsage('base64', NOW);
        expect(clearUsage()).toBe(true);
        expect(readUsage()).toEqual({});
    });
});

describe('저장소 접근이 막힌 경우', () => {
    it('읽기가 차단되면 예외 없이 빈 객체를 준다', () => {
        const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });

        expect(() => readUsage()).not.toThrow();
        expect(readUsage()).toEqual({});

        spy.mockRestore();
    });

    it('삭제가 차단되면 예외 없이 false 를 준다', () => {
        const spy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
            throw new Error('SecurityError');
        });

        expect(() => clearUsage()).not.toThrow();
        expect(clearUsage()).toBe(false);

        spy.mockRestore();
    });
});
