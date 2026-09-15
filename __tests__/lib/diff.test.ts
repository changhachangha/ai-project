import { processDiff } from '@/lib/tools/diff';

describe('lib/tools/diff', () => {
    it('동일한 텍스트는 변경 없음만 표시한다', () => {
        const result = processDiff({ originalText: 'a\nb\n', newText: 'a\nb\n' }, 'lines');
        expect(result.parts.every((part) => !part.added && !part.removed)).toBe(true);
    });

    it('라인 단위 diff 는 추가/삭제 를 표시한다', () => {
        const result = processDiff({ originalText: 'a\n', newText: 'b\n' }, 'lines');
        expect(result.parts.some((part) => part.removed)).toBe(true);
        expect(result.parts.some((part) => part.added)).toBe(true);
    });

    it('문자 단위 diff 를 지원한다', () => {
        const result = processDiff({ originalText: 'abc', newText: 'abd' }, 'chars');
        expect(result.parts.some((part) => part.removed)).toBe(true);
        expect(result.parts.some((part) => part.added)).toBe(true);
        expect(result.parts.some((part) => !part.added && !part.removed)).toBe(true);
    });

    it('단어 단위 diff 를 지원한다', () => {
        const result = processDiff({ originalText: 'hello world', newText: 'hello there' }, 'words');
        expect(result.parts.some((part) => part.removed)).toBe(true);
        expect(result.parts.some((part) => part.added)).toBe(true);
    });

    it('diffResult 는 span 태그로 감싸진 HTML 조각이다 (API 계약)', () => {
        const result = processDiff({ originalText: 'a', newText: 'a' }, 'lines');
        expect(result.diffResult).toMatch(/^<span style="color:/);
    });

    it('diffResult 에 들어가는 텍스트는 HTML 이스케이프된다', () => {
        const result = processDiff(
            { originalText: '<script>alert(1)</script>', newText: '<b>safe</b>' },
            'lines'
        );
        expect(result.diffResult).not.toContain('<script>');
        expect(result.diffResult).not.toContain('<b>safe</b>');
        expect(result.diffResult).toContain('&lt;script&gt;');
    });
});
