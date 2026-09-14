import { processDiff } from '@/lib/tools/diff';

describe('lib/tools/diff', () => {
    it('동일한 텍스트는 변경 없음(grey)만 표시한다', () => {
        const result = processDiff({ originalText: 'a\nb\n', newText: 'a\nb\n' }, 'lines');
        expect(result.diffResult).toContain('grey');
        expect(result.diffResult).not.toContain('green');
        expect(result.diffResult).not.toContain('red');
    });

    it('라인 단위 diff 는 추가(green)/삭제(red) 를 표시한다', () => {
        const result = processDiff({ originalText: 'a\n', newText: 'b\n' }, 'lines');
        expect(result.diffResult).toContain('red');
        expect(result.diffResult).toContain('green');
    });

    it('문자 단위 diff 를 지원한다', () => {
        const result = processDiff({ originalText: 'abc', newText: 'abd' }, 'chars');
        expect(result.diffResult).toContain('red');
        expect(result.diffResult).toContain('green');
        expect(result.diffResult).toContain('grey');
    });

    it('단어 단위 diff 를 지원한다', () => {
        const result = processDiff({ originalText: 'hello world', newText: 'hello there' }, 'words');
        expect(result.diffResult).toContain('red');
        expect(result.diffResult).toContain('green');
    });

    it('결과는 span 태그로 감싸진 HTML 조각이다', () => {
        const result = processDiff({ originalText: 'a', newText: 'a' }, 'lines');
        expect(result.diffResult).toMatch(/^<span style="color:/);
    });
});
