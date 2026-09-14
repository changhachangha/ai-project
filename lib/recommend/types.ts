import type { Integration } from '@/app/data/types';

/**
 * 추천 사유.
 * UI 라벨과 정렬 근거로 함께 쓰이므로, 값 자체를 화면 문구로 매핑해 두는 표를 아래에 둔다.
 */
export type RecommendReason =
    | 'related'
    | 'same-category'
    | 'tag-overlap'
    | 'similar-content'
    | 'recently-used'
    | 'favorite';

/** 사유 코드 → 화면 라벨 */
export const REASON_LABELS: Record<RecommendReason, string> = {
    related: '함께 쓰는 도구',
    'same-category': '같은 카테고리',
    'tag-overlap': '태그 유사',
    'similar-content': '설명 유사',
    'recently-used': '최근 사용',
    favorite: '즐겨찾기',
};

/** 추천 결과 한 건. 점수는 여러 신호의 가중 합이며, 사유는 복수일 수 있다. */
export type Recommendation = {
    tool: Integration;
    score: number;
    reasons: RecommendReason[];
};

/** 신호별 점수 기여분. 디버깅과 테스트에서 "왜 이 순위인지" 확인하는 데 쓴다. */
export type ScoreBreakdown = Partial<Record<RecommendReason, number>>;

export type ScoredTool = {
    tool: Integration;
    score: number;
    reasons: RecommendReason[];
    breakdown: ScoreBreakdown;
};
