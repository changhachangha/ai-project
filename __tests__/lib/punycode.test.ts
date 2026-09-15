import { encodePunycode, decodePunycode } from '@/lib/tools/punycode';

describe('lib/tools/punycode', () => {
    it('한글 도메인을 xn-- 형태로 인코딩한다', () => {
        const result = encodePunycode('한국.com');
        expect(result.text).toBe('xn--3e0b707e.com');
        expect(result.errorMessage).toBeUndefined();
    });

    it('xn-- 도메인을 유니코드로 디코딩한다', () => {
        const result = decodePunycode('xn--3e0b707e.com');
        expect(result.text).toBe('한국.com');
    });

    it('ASCII 입력은 그대로 통과한다', () => {
        expect(encodePunycode('example.com').text).toBe('example.com');
        expect(decodePunycode('example.com').text).toBe('example.com');
    });

    it('인코딩-디코딩 왕복이 복원된다', () => {
        const encoded = encodePunycode('münchen.de');
        expect(encoded.text).toBe('xn--mnchen-3ya.de');
        expect(decodePunycode(encoded.text).text).toBe('münchen.de');
    });
});
