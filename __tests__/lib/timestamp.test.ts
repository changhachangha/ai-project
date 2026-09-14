import { processTimestamp } from '@/lib/tools/timestamp';

describe('lib/tools/timestamp', () => {
    const opts = { format: 'YYYY-MM-DD HH:mm:ss', timezone: 'UTC' };

    it('Unix 타임스탬프(초)를 사람이 읽는 형식으로 변환한다', () => {
        const result = processTimestamp({ timestamp: 0 }, opts);
        expect(result.humanReadableDate).toBe('1970-01-01 00:00:00');
        expect(result.unixTimestamp).toBe(0);
        expect(result.errorMessage).toBeUndefined();
    });

    it('날짜 문자열을 파싱해 Unix 타임스탬프를 계산한다', () => {
        const result = processTimestamp({ timestamp: '2024-01-01T00:00:00Z' }, opts);
        expect(result.unixTimestamp).toBe(1704067200);
        expect(result.humanReadableDate).toBe('2024-01-01 00:00:00');
    });

    it('타임존 옵션을 적용한다', () => {
        const result = processTimestamp({ timestamp: 0 }, { format: 'YYYY-MM-DD HH:mm', timezone: 'Asia/Seoul' });
        expect(result.humanReadableDate).toBe('1970-01-01 09:00');
    });

    it('커스텀 포맷을 적용한다', () => {
        const result = processTimestamp({ timestamp: 0 }, { format: 'YYYY/MM/DD', timezone: 'UTC' });
        expect(result.humanReadableDate).toBe('1970/01/01');
    });

    it('잘못된 입력은 에러 메시지를 반환한다', () => {
        const result = processTimestamp({ timestamp: 'not-a-date' }, opts);
        expect(result.humanReadableDate).toBe('');
        expect(result.unixTimestamp).toBe(0);
        expect(result.errorMessage).toBeTruthy();
    });
});
