import { DiffToolInput, DiffToolOutput } from '@/lib/types/tools';
import { diffChars, diffLines, diffWords, Change } from 'jsdiff';

export const processDiff = (input: DiffToolInput, type: 'chars' | 'words' | 'lines'): DiffToolOutput => {
    let diffResult = '';
    let changes;

    switch (type) {
        case 'chars':
            changes = diffChars(input.originalText, input.newText);
            break;
        case 'words':
            changes = diffWords(input.originalText, input.newText);
            break;
        case 'lines':
            changes = diffLines(input.originalText, input.newText);
            break;
        default:
            changes = diffLines(input.originalText, input.newText);
    }

    changes.forEach((part: Change) => {
        const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
        diffResult += `<span style="color:${color};">${part.value}</span>`;
    });

    return { diffResult };
};
