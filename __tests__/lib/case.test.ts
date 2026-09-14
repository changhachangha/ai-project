import { splitWords, convertCase, convertAllCases, CASE_TYPES } from '@/lib/tools/case';

describe('lib/tools/case', () => {
    describe('splitWords', () => {
        it('camelCase 를 단어로 분해한다', () => {
            expect(splitWords('myVariableName')).toEqual(['my', 'Variable', 'Name']);
        });

        it('snake/kebab/dot/공백 구분자를 모두 처리한다', () => {
            expect(splitWords('my_variable-name.test')).toEqual(['my', 'variable', 'name', 'test']);
        });

        it('연속 대문자(PascalCase/약어)를 분해한다', () => {
            expect(splitWords('HTTPServer')).toEqual(['HTTP', 'Server']);
            expect(splitWords('MyClassName')).toEqual(['My', 'Class', 'Name']);
        });

        it('빈 문자열은 빈 배열을 반환한다', () => {
            expect(splitWords('')).toEqual([]);
            expect(splitWords('   ')).toEqual([]);
        });
    });

    describe('convertCase', () => {
        const input = 'my variable name';

        it.each([
            ['camel', 'myVariableName'],
            ['pascal', 'MyVariableName'],
            ['snake', 'my_variable_name'],
            ['kebab', 'my-variable-name'],
            ['constant', 'MY_VARIABLE_NAME'],
            ['title', 'My Variable Name'],
            ['lower', 'my variable name'],
            ['upper', 'MY VARIABLE NAME'],
            ['dot', 'my.variable.name'],
        ] as const)('%s 변환', (type, expected) => {
            expect(convertCase(input, type)).toBe(expected);
        });

        it('이미 다른 표기법이어도 동일하게 정규화한다', () => {
            expect(convertCase('myVariableName', 'snake')).toBe('my_variable_name');
            expect(convertCase('my-variable-name', 'camel')).toBe('myVariableName');
            expect(convertCase('MY_VARIABLE_NAME', 'kebab')).toBe('my-variable-name');
        });

        it('빈 입력은 빈 문자열을 반환한다', () => {
            expect(convertCase('', 'camel')).toBe('');
        });

        it('한글은 대소문자 변환 없이 유지한다', () => {
            expect(convertCase('안녕하세요', 'upper')).toBe('안녕하세요');
        });
    });

    describe('convertAllCases', () => {
        it('지원하는 모든 케이스를 반환한다', () => {
            const results = convertAllCases('foo bar');
            expect(results).toHaveLength(CASE_TYPES.length);
            expect(results.map((r) => r.type)).toEqual(CASE_TYPES);
            expect(results.every((r) => r.label.length > 0)).toBe(true);
        });

        it('빈 입력에서는 모든 값이 빈 문자열이다', () => {
            expect(convertAllCases('').every((r) => r.value === '')).toBe(true);
        });
    });
});
