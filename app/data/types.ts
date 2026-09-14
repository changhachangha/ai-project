import type { LucideIcon } from 'lucide-react';

// 두 파일에서 공통으로 사용하던 타입을 이 파일에 정의합니다.
export type Integration = {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: LucideIcon;
    color: string;
    /**
     * 추천 계산에 쓰는 세분화 키워드.
     * category 는 5종뿐이라 유사도를 계산하기엔 너무 굵습니다.
     * tags 는 카테고리보다 한 단계 좁은 개념(예: 'JSON', '해시', '이미지')을 담습니다.
     */
    tags: string[];
    /**
     * 사람이 직접 지정한 연관 도구 id 목록.
     * 카테고리가 달라도 실제로 함께 쓰는 조합(예: JWT 디코더 → Base64)을 담당합니다.
     * 자동 계산으로 잡히지 않는 관계를 보정하는 용도이므로 추천 점수에서 가장 높은 가중치를 받습니다.
     */
    related?: string[];
};
