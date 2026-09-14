import { processEncode, processDecode } from '@/lib/tools/encode';

describe('lib/tools/encode', () => {
    describe('processEncode', () => {
        it('ASCII 문자열을 base64 로 인코딩한다', () => {
            const result = processEncode({ text: 'hello', encodingType: 'base64' });
            expect(result.encodedText).toBe('aGVsbG8=');
            expect(result.errorMessage).toBeUndefined();
        });

        it('한글(멀티바이트) 문자열도 UTF-8 기준으로 인코딩한다', () => {
            const result = processEncode({ text: '안녕', encodingType: 'base64' });
            // '안녕' 의 UTF-8 바이트를 base64 로 표현한 값
            expect(result.encodedText).toBe(Buffer.from('안녕', 'utf-8').toString('base64'));
        });

        it('URL 인코딩을 수행한다', () => {
            const result = processEncode({ text: 'a b&c=d', encodingType: 'url' });
            expect(result.encodedText).toBe('a%20b%26c%3Dd');
        });

        it('HTML 특수문자를 이스케이프한다', () => {
            const result = processEncode({ text: `<div class="x">it's & more</div>`, encodingType: 'html' });
            expect(result.encodedText).toBe(
                '&lt;div class=&quot;x&quot;&gt;it&#039;s &amp; more&lt;/div&gt;'
            );
        });

        it('빈 문자열은 빈 결과를 반환한다', () => {
            const result = processEncode({ text: '', encodingType: 'base64' });
            expect(result.encodedText).toBe('');
        });
    });

    describe('processDecode', () => {
        it('base64 를 원문으로 복원한다 (왕복 검증)', () => {
            const original = 'Hello, 안녕하세요! 🎉';
            const encoded = processEncode({ text: original, encodingType: 'base64' }).encodedText;
            const decoded = processDecode({ text: encoded, encodingType: 'base64' });
            expect(decoded.decodedText).toBe(original);
            expect(decoded.errorMessage).toBeUndefined();
        });

        it('URL 디코딩을 수행한다', () => {
            const result = processDecode({ text: 'a%20b%26c%3Dd', encodingType: 'url' });
            expect(result.decodedText).toBe('a b&c=d');
        });

        it('HTML 엔티티를 원문으로 복원한다', () => {
            const result = processDecode({ text: '&lt;b&gt;hi&lt;/b&gt;', encodingType: 'html' });
            expect(result.decodedText).toBe('<b>hi</b>');
        });

        it('잘못된 base64 입력 시 에러 메시지를 반환한다', () => {
            const result = processDecode({ text: '!!!not-base64!!!', encodingType: 'base64' });
            expect(result.decodedText).toBe('');
            expect(result.errorMessage).toBeTruthy();
        });

        it('잘못된 URL 인코딩 입력 시 에러 메시지를 반환한다', () => {
            const result = processDecode({ text: '%E0%A4%A', encodingType: 'url' });
            expect(result.decodedText).toBe('');
            expect(result.errorMessage).toBeTruthy();
        });
    });
});
