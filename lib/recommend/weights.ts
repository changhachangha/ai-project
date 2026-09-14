/**
 * 추천 점수 가중치.
 *
 * 조정 지점을 한 파일로 모은 이유: 가중치가 여러 모듈에 흩어지면
 * "왜 이 도구가 1위인지" 추적할 때 코드를 여러 곳에서 읽어야 한다.
 * 순위가 이상할 때는 이 파일의 숫자만 바꿔 확인한다.
 */
export const SIGNAL_WEIGHTS = {
    /** 사람이 직접 지정한 연관. 가장 정확하므로 최상위 */
    related: 5.0,
    /** 같은 카테고리. 도구 성격이 같을 확률이 높다 */
    sameCategory: 3.0,
    /** 태그 교집합 1개당 점수 (상한은 tagOverlapCap) */
    tagOverlap: 2.0,
    /** 설명·이름 유사도 (Phase 2). 코사인 유사도 0~1 에 곱한다 */
    similarContent: 4.0,
    /** 최근 사용 빈도 (Phase 3) */
    recentUsage: 1.5,
    /** 즐겨찾기 등록 여부 (Phase 3) */
    favorite: 1.0,
    /** 이미 추천 목록에 오른 항목의 중복 노출 억제 */
    alreadyShown: -2.0,
} as const;

/** 태그 교집합 점수 상한. 태그가 많은 도구가 무조건 이기는 것을 막는다 */
export const TAG_OVERLAP_CAP = 2;

/**
 * 같은 카테고리에서 뽑을 수 있는 최대 개수.
 * 이 제한이 없으면 상위권이 한 카테고리로 도배되어 추천의 의미가 사라진다.
 */
export const MAX_PER_CATEGORY = 2;

/** 관련 도구 기본 노출 개수 */
export const DEFAULT_RELATED_LIMIT = 4;

/** 홈 추천 영역 기본 노출 개수 */
export const DEFAULT_FEATURED_LIMIT = 10;

/**
 * 최근 사용으로 인정하는 기간(밀리초).
 * 30일보다 오래된 기록은 개인화 신호로 쓰지 않는다.
 */
export const RECENT_USAGE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
