/**
 * @jest-environment node
 */
import {
    clearMetrics,
    readMetrics,
    recordClick,
    recordImpressions,
    summarizeMetrics,
    writeMetrics,
} from '@/lib/recommend/metrics';

/**
 * 서버 렌더링 경로.
 *
 * 이 프로젝트는 전 라우트를 정적 프리렌더한다. 즉 이 모듈은 window 가 없는
 * 환경에서도 최소 한 번은 실행된다. 저장소가 없을 때 예외가 나면 빌드가 깨진다.
 */
describe('metrics — window 없는 환경', () => {
    it('window 가 정말 없다', () => {
        expect(typeof window).toBe('undefined');
    });

    it('읽기는 빈 객체를 준다', () => {
        expect(readMetrics()).toEqual({});
    });

    it('쓰기는 false 를 준다 (조용히 포기)', () => {
        expect(writeMetrics({ a: { impressions: 1, clicks: 0 } })).toBe(false);
    });

    it('삭제는 false 를 준다', () => {
        expect(clearMetrics()).toBe(false);
    });

    it('기록 호출이 예외를 던지지 않는다', () => {
        expect(() => recordImpressions(['a', 'b'])).not.toThrow();
        expect(() => recordClick('a')).not.toThrow();
    });

    it('요약은 빈 값 기준으로 계산된다', () => {
        expect(summarizeMetrics(readMetrics())).toEqual({
            impressions: 0,
            clicks: 0,
            clickThroughRate: 0,
            topClicked: [],
        });
    });
});
