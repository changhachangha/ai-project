/**
 * @jest-environment node
 *
 * 서버 렌더링 환경(window 없음)에서 사용 기록 모듈이 예외를 던지지 않는지 확인한다.
 *
 * jsdom 환경에서는 window 를 제거할 수 없어(재정의 불가) 이 경로를 검증할 수 없다.
 * 별도 파일로 분리해 node 환경에서 실제로 window 가 없는 상태를 만든다.
 */
import { clearUsage, readUsage, recordUsage, writeUsage } from '@/lib/recommend/usage';

it('window 가 없으면 읽기가 빈 객체를 준다', () => {
    expect(typeof window).toBe('undefined');
    expect(readUsage()).toEqual({});
});

it('window 가 없으면 쓰기가 false 를 준다', () => {
    expect(writeUsage({ a: { count: 1, lastUsedAt: Date.now() } })).toBe(false);
});

it('window 가 없으면 삭제가 false 를 준다', () => {
    expect(clearUsage()).toBe(false);
});

it('window 가 없어도 recordUsage 가 예외 없이 맵을 돌려준다', () => {
    const usage = recordUsage('base64', 1_700_000_000_000);

    // 저장은 실패하지만 메모리상 결과는 정상적으로 만들어져야 한다.
    expect(usage.base64.count).toBe(1);
});
