import { processJson } from '@/lib/tools/json';

describe('lib/tools/json', () => {
    it('JSON 을 지정한 들여쓰기로 포매팅한다', () => {
        const result = processJson(
            { jsonString: '{"b":1,"a":[1,2]}' },
            { indentation: 2, minify: false, sortKeys: false }
        );
        expect(result.isValid).toBe(true);
        expect(result.formattedJson).toBe('{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}');
    });

    it('탭 들여쓰기를 지원한다', () => {
        const result = processJson(
            { jsonString: '{"a":1}' },
            { indentation: 'tab', minify: false, sortKeys: false }
        );
        expect(result.formattedJson).toBe('{\n\t"a": 1\n}');
    });

    it('minify 옵션은 공백 없는 한 줄로 만든다', () => {
        const result = processJson(
            { jsonString: '{\n  "a": 1,\n  "b": [1, 2]\n}' },
            { indentation: 2, minify: true, sortKeys: false }
        );
        expect(result.formattedJson).toBe('{"a":1,"b":[1,2]}');
    });

    it('sortKeys 는 중첩 객체의 키까지 재귀적으로 정렬한다', () => {
        const result = processJson(
            { jsonString: '{"b":{"z":1,"a":2},"a":3}' },
            { indentation: 2, minify: false, sortKeys: true }
        );
        expect(result.formattedJson).toBe('{\n  "a": 3,\n  "b": {\n    "a": 2,\n    "z": 1\n  }\n}');
    });

    it('sortKeys 는 배열 순서를 유지한다', () => {
        const result = processJson(
            { jsonString: '{"b":[3,1,2],"a":1}' },
            { indentation: 2, minify: true, sortKeys: true }
        );
        expect(result.formattedJson).toBe('{"a":1,"b":[3,1,2]}');
    });

    it('잘못된 JSON 은 isValid=false 와 에러 메시지를 반환한다', () => {
        const result = processJson(
            { jsonString: '{invalid}' },
            { indentation: 2, minify: false, sortKeys: false }
        );
        expect(result.isValid).toBe(false);
        expect(result.formattedJson).toBe('');
        expect(result.errorMessage).toBeTruthy();
    });
});
