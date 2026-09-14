import { buildDocumentText, tokenize } from '@/lib/recommend/tokenize';

describe('tokenize', () => {
    it('소문자로 정규화하고 기호를 제거한다', () => {
        const tokens = tokenize('JSON ↔️ XML');

        expect(tokens).toContain('json');
        expect(tokens).toContain('xml');
        expect(tokens.some((token) => token.includes('↔'))).toBe(false);
    });

    it('불용어를 제거한다', () => {
        const tokens = tokenize('텍스트를 변환하는 도구');

        expect(tokens).not.toContain('를');
        expect(tokens).not.toContain('도구');
    });

    it('한글 토큰에서 2-gram 을 만든다', () => {
        const tokens = tokenize('포매터');

        expect(tokens).toContain('포매터');
        expect(tokens).toContain('포매');
        expect(tokens).toContain('매터');
    });

    it('한 글자 토큰에는 2-gram 을 만들지 않는다', () => {
        const tokens = tokenize('a b');

        expect(tokens).toEqual(['a', 'b']);
    });

    it('긴 영문 토큰을 잘라낸다', () => {
        const long = 'a'.repeat(60);
        const tokens = tokenize(long);

        expect(tokens[0].length).toBe(20);
    });

    it('빈 문자열과 기호만 있는 입력에 빈 배열을 준다', () => {
        expect(tokenize('')).toEqual([]);
        expect(tokenize('   ')).toEqual([]);
        expect(tokenize('!!!###')).toEqual([]);
    });

    it('같은 입력에 항상 같은 결과를 준다', () => {
        expect(tokenize('Base64 인코더/디코더')).toEqual(tokenize('Base64 인코더/디코더'));
    });
});

describe('buildDocumentText', () => {
    it('이름·설명·카테고리·태그를 모두 포함한다', () => {
        const text = buildDocumentText({
            name: '해시 생성기',
            description: 'SHA 해시를 만듭니다.',
            category: '보안/암호화',
            tags: ['해시', '무결성'],
        });

        expect(text).toContain('해시 생성기');
        expect(text).toContain('SHA 해시를 만듭니다.');
        expect(text).toContain('보안/암호화');
        expect(text).toContain('무결성');
    });

    it('태그를 두 번 넣어 가중치를 높인다', () => {
        const text = buildDocumentText({ name: '', description: '', category: '', tags: ['고유태그'] });

        expect(text.split('고유태그').length - 1).toBe(2);
    });
});
