import { DiffToolInput, DiffToolOutput, DiffPart } from '@/lib/types/tools';
import { diffChars, diffLines, diffWords } from 'diff';

const escapeHtml = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const processDiff = (input: DiffToolInput, type: 'chars' | 'words' | 'lines'): DiffToolOutput => {
    let changes;

    switch (type) {
        case 'chars':
            changes = diffChars(input.originalText, input.newText);
            break;
        case 'words':
            changes = diffWords(input.originalText, input.newText);
            break;
        default:
            changes = diffLines(input.originalText, input.newText);
    }

    const parts: DiffPart[] = changes.map((part) => ({
        value: part.value,
        added: part.added === true,
        removed: part.removed === true,
    }));

    // API 계약상 HTML 조각을 함께 반환한다. 값은 이스케이프한다 —
    // 이 문자열을 innerHTML 로 렌더하는 소비자가 있을 수 있기 때문이다.
    const diffResult = parts
        .map((part) => {
            const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
            return `<span style="color:${color};">${escapeHtml(part.value)}</span>`;
        })
        .join('');

    return { diffResult, parts };
};
