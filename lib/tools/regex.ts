export interface RegexSegment {
    text: string;
    matched: boolean;
}

export interface RegexTestOutput {
    segments: RegexSegment[];
    matchCount: number;
    errorMessage?: string;
}

// 테스트 문자열을 매치/비매치 세그먼트로 나눈다 — UI 가 HTML 조합 없이
// React 노드로 안전하게 렌더할 수 있는 형태.
export const testRegex = (pattern: string, flags: string, text: string): RegexTestOutput => {
    if (!pattern) {
        return { segments: text ? [{ text, matched: false }] : [], matchCount: 0 };
    }

    let regex: RegExp;
    try {
        // exec 순회를 위해 g 플래그를 강제한다.
        regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
    } catch (error: unknown) {
        return {
            segments: text ? [{ text, matched: false }] : [],
            matchCount: 0,
            errorMessage: error instanceof Error ? error.message : String(error),
        };
    }

    const segments: RegexSegment[] = [];
    let matchCount = 0;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ text: text.slice(lastIndex, match.index), matched: false });
        }
        segments.push({ text: match[0], matched: true });
        matchCount++;
        lastIndex = match.index + match[0].length;
        // 빈 매치는 lastIndex를 밀어 무한 루프를 막는다.
        if (match[0].length === 0) {
            regex.lastIndex++;
        }
    }

    if (lastIndex < text.length) {
        segments.push({ text: text.slice(lastIndex), matched: false });
    }

    return { segments, matchCount };
};
