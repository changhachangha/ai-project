/**
 * 한국어 대응 토큰화.
 *
 * 형태소 분석기를 쓰지 않은 이유:
 *  - 도구가 47개뿐이라 분석기 도입으로 얻는 정확도 향상이 미미하다.
 *  - 의존성이 하나 늘면 번들 크기와 유지보수 비용이 함께 늘어난다.
 * 대신 **공백 토큰 + 문자 2-gram** 을 함께 쓴다. 공백 토큰은 정확도를,
 * 2-gram 은 조사가 붙은 변형("변환기", "변환합니다")을 잡는 재현율을 담당한다.
 */

/** 문서에 자주 나오지만 도구를 구분해 주지 못하는 단어. 점수만 흐린다. */
const STOPWORDS = new Set([
    // 조사·접속
    '의', '를', '을', '이', '가', '은', '는', '과', '와', '로', '으로', '에서', '부터', '까지', '보다',
    '처럼', '같은', '통해', '및', '등', '수', '것', '때',
    // 서술어 어미
    '합니다', '하거나', '하는', '있는', '위한', '대한', '됩니다', '합니다.',
    // 거의 모든 설명에 등장하는 일반어
    '도구', '사용', '지원', '기능', '변환', '텍스트',
]);

/** 2-gram 을 만들 최소 길이. 한 글자 토큰은 그대로만 쓴다. */
const BIGRAM_MIN_LENGTH = 2;

/** 토큰 하나의 최대 길이. 긴 영문 식별자가 통째로 들어오는 것을 막는다. */
const MAX_TOKEN_LENGTH = 20;

/**
 * 문자열을 비교 가능한 토큰 배열로 바꾼다.
 * 같은 입력에는 항상 같은 결과를 준다(정렬·중복 제거 포함).
 */
export function tokenize(text: string): string[] {
    if (!text) return [];

    const normalized = text
        .toLowerCase()
        // 한글·영문·숫자만 남기고 나머지(기호, 이모지, 중점)는 공백으로 바꾼다.
        .replace(/[^0-9a-z가-힣\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!normalized) return [];

    const tokens: string[] = [];

    for (const word of normalized.split(' ')) {
        if (!word || STOPWORDS.has(word)) continue;

        const clipped = word.slice(0, MAX_TOKEN_LENGTH);
        tokens.push(clipped);

        // 2-gram: "포매터" → "포매", "매터"
        if (clipped.length >= BIGRAM_MIN_LENGTH) {
            for (let i = 0; i + 2 <= clipped.length; i += 1) {
                const bigram = clipped.slice(i, i + 2);
                if (STOPWORDS.has(bigram)) continue;
                tokens.push(bigram);
            }
        }
    }

    return tokens;
}

/** 도구 하나를 문서 텍스트로 만든다. 태그는 두 번 넣어 가중치를 높인다. */
export function buildDocumentText(tool: {
    name: string;
    description: string;
    category: string;
    tags?: string[];
}): string {
    const tags = (tool.tags ?? []).join(' ');
    return [tool.name, tool.description, tool.category, tags, tags].join(' ');
}
