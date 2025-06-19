declare module 'jsdiff' {
    export function diffChars(oldStr: string, newStr: string): Change[];
    export function diffLines(oldStr: string, newStr: string): Change[];
    export function diffWords(oldStr: string, newStr: string): Change[];

    interface Change {
        value: string;
        added?: boolean;
        removed?: boolean;
        // count?: number; // Not directly used in the provided code, but often part of diff output
    }
}
