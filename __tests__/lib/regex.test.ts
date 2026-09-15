import { testRegex } from '@/lib/tools/regex';

describe('lib/tools/regex', () => {
    it('매치된 부분을 세그먼트로 나눈다', () => {
        const result = testRegex('\\d+', 'g', 'a1b22c');
        expect(result.segments).toEqual([
            { text: 'a', matched: false },
            { text: '1', matched: true },
            { text: 'b', matched: false },
            { text: '22', matched: true },
            { text: 'c', matched: false },
        ]);
        expect(result.matchCount).toBe(2);
    });

    it('g 플래그가 없어도 전체 매치를 순회한다', () => {
        const result = testRegex('a', '', 'banana');
        expect(result.matchCount).toBe(3);
    });

    it('패턴이 비어 있으면 전체가 비매치 세그먼트다', () => {
        const result = testRegex('', 'g', 'hello');
        expect(result.segments).toEqual([{ text: 'hello', matched: false }]);
        expect(result.matchCount).toBe(0);
    });

    it('잘못된 패턴은 에러 메시지를 반환한다', () => {
        const result = testRegex('(', 'g', 'text');
        expect(result.errorMessage).toBeTruthy();
        expect(result.matchCount).toBe(0);
        expect(result.segments).toEqual([{ text: 'text', matched: false }]);
    });

    it('빈 매치 패턴에서 무한 루프하지 않는다', () => {
        const result = testRegex('a*', 'g', 'bbb');
        expect(result.errorMessage).toBeUndefined();
        expect(result.segments.map((s) => s.text).join('')).toBe('bbb');
    });

    it('HTML 특수문자가 포함된 텍스트도 그대로 세그먼트에 담는다', () => {
        const result = testRegex('<b>', 'g', 'x<b>y');
        expect(result.segments).toEqual([
            { text: 'x', matched: false },
            { text: '<b>', matched: true },
            { text: 'y', matched: false },
        ]);
    });
});
