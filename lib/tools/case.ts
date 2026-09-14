/**
 * 텍스트 케이스 변환 로직
 *
 * camelCase / snake_case / kebab-case / CONSTANT_CASE 등 여러 표기를
 * 단어 단위로 분해한 뒤 목표 표기법으로 재조합한다.
 */

export type CaseType =
    | 'camel'
    | 'pascal'
    | 'snake'
    | 'kebab'
    | 'constant'
    | 'title'
    | 'lower'
    | 'upper'
    | 'dot';

export interface CaseResult {
    type: CaseType;
    label: string;
    value: string;
}

export const CASE_LABELS: Record<CaseType, string> = {
    camel: 'camelCase',
    pascal: 'PascalCase',
    snake: 'snake_case',
    kebab: 'kebab-case',
    constant: 'CONSTANT_CASE',
    title: 'Title Case',
    lower: 'lower case',
    upper: 'UPPER CASE',
    dot: 'dot.case',
};

export const CASE_TYPES: CaseType[] = [
    'camel',
    'pascal',
    'snake',
    'kebab',
    'constant',
    'title',
    'lower',
    'upper',
    'dot',
];

/**
 * 입력 문자열을 단어 배열로 분해한다.
 * camelCase / PascalCase / snake_case / kebab-case / dot.case / 공백을 모두 처리한다.
 */
export function splitWords(text: string): string[] {
    if (!text) return [];

    const normalized = text
        // camelCase → camel Case
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        // HTTPServer → HTTP Server
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        // 구분자 통일
        .replace(/[_\-.\s]+/g, ' ')
        .trim();

    return normalized ? normalized.split(' ') : [];
}

const capitalize = (word: string): string =>
    word.length === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

/** 단일 케이스로 변환한다. */
export function convertCase(text: string, target: CaseType): string {
    const words = splitWords(text);
    if (words.length === 0) return '';

    const lowerWords = words.map((w) => w.toLowerCase());

    switch (target) {
        case 'camel':
            return lowerWords
                .map((word, index) => (index === 0 ? word : capitalize(word)))
                .join('');
        case 'pascal':
            return words.map(capitalize).join('');
        case 'snake':
            return lowerWords.join('_');
        case 'kebab':
            return lowerWords.join('-');
        case 'constant':
            return words.map((w) => w.toUpperCase()).join('_');
        case 'title':
            return words.map(capitalize).join(' ');
        case 'lower':
            return lowerWords.join(' ');
        case 'upper':
            return words.map((w) => w.toUpperCase()).join(' ');
        case 'dot':
            return lowerWords.join('.');
        default:
            return text;
    }
}

/** 지원하는 모든 케이스로 한 번에 변환한다. */
export function convertAllCases(text: string): CaseResult[] {
    return CASE_TYPES.map((type) => ({
        type,
        label: CASE_LABELS[type],
        value: convertCase(text, type),
    }));
}
