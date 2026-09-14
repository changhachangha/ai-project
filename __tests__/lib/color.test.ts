import { processColor } from '@/lib/tools/color';

describe('lib/tools/color', () => {
    it('HEX 를 RGB/HSL 로 변환한다', () => {
        const result = processColor({ color: '#00FF00' });
        expect(result.hex).toBe('#00ff00');
        expect(result.rgb).toBe('rgb(0,255,0)');
        expect(result.hsl).toBe('hsl(120,100%,50%)');
        expect(result.errorMessage).toBeUndefined();
    });

    it('RGB 를 HEX/HSL 로 변환한다', () => {
        const result = processColor({ color: 'rgb(0, 0, 255)' });
        expect(result.hex).toBe('#0000ff');
        expect(result.hsl).toBe('hsl(240,100%,50%)');
    });

    it('HSL 을 RGB/HEX 로 변환한다', () => {
        const result = processColor({ color: 'hsl(0, 100%, 50%)' });
        expect(result.rgb).toBe('rgb(255,0,0)');
        expect(result.hex).toBe('#ff0000');
    });

    it('HEX→RGB→HEX 왕복이 일관적이다', () => {
        const original = processColor({ color: '#1a2b3c' });
        const roundTrip = processColor({ color: original.rgb });
        expect(roundTrip.hex).toBe('#1a2b3c');
    });

    it('지원하지 않는 형식은 에러 메시지를 반환한다', () => {
        const result = processColor({ color: 'blue' });
        expect(result.hex).toBe('');
        expect(result.rgb).toBe('');
        expect(result.hsl).toBe('');
        expect(result.errorMessage).toContain('Unsupported color format');
    });

    it('형식이 깨진 rgb() 는 에러 메시지를 반환한다', () => {
        const result = processColor({ color: 'rgb(1,2)' });
        expect(result.errorMessage).toBeTruthy();
    });
});
