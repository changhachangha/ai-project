/**
 * 중앙집중식 라우팅 유틸리티
 * 모든 카테고리-경로 매핑을 한 곳에서 관리
 */

export interface CategoryMapping {
    category: string;
    path: string;
    description: string;
}

/**
 * 카테고리별 경로 매핑 테이블
 * 새로운 카테고리 추가 시 반드시 여기에 등록해야 함
 */
export const CATEGORY_PATH_MAPPINGS: CategoryMapping[] = [
    {
        category: '베이스 인코딩',
        path: 'encoding',
        description: 'Base64, Base32, Hex 등 인코딩 도구',
    },
    {
        category: 'URL/텍스트 처리',
        path: 'encoding',
        description: 'URL 인코더, HTML 인코더 등',
    },
    {
        category: '진수 변환',
        path: 'encoding',
        description: '2진수, 8진수, 16진수 변환',
    },
    {
        category: '텍스트 처리',
        path: 'text',
        description: 'JSON 포매터, SQL 포매터, Markdown 등',
    },
    {
        category: '보안/암호화',
        path: 'security',
        description: 'JWT, 해시, RSA 키, 패스워드 생성기 등',
    },
    {
        category: '시간/날짜',
        path: 'conversion',
        description: '타임스탬프 변환기',
    },
    {
        category: '색상',
        path: 'conversion',
        description: '색상 형식 변환기',
    },
    {
        category: '유틸리티',
        path: 'conversion',
        description: 'UUID 생성기, QR 코드 생성기 등',
    },
];

/**
 * 카테고리 이름을 URL 경로로 변환
 * @param category 카테고리 이름
 * @returns 해당하는 URL 경로
 */
export function getPathForCategory(category: string): string {
    const mapping = CATEGORY_PATH_MAPPINGS.find((m) => m.category === category);

    if (!mapping) {
        console.warn(`⚠️ 알 수 없는 카테고리: "${category}". encoding 경로로 기본 설정됩니다.`);
        return 'encoding';
    }

    return mapping.path;
}

/**
 * 등록된 모든 카테고리 목록 반환
 */
export function getAllCategories(): string[] {
    return CATEGORY_PATH_MAPPINGS.map((m) => m.category);
}

/**
 * 경로별 카테고리 목록 반환
 */
export function getCategoriesByPath(path: string): string[] {
    return CATEGORY_PATH_MAPPINGS.filter((m) => m.path === path).map((m) => m.category);
}

/**
 * 라우팅 설정 검증 함수
 * 개발 시 일관성 체크용
 */
export function validateRoutingConfig(): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    const paths = new Set<string>();

    CATEGORY_PATH_MAPPINGS.forEach((mapping) => {
        // 경로 중복 체크
        paths.add(mapping.path);

        // 필수 필드 체크
        if (!mapping.category || !mapping.path || !mapping.description) {
            errors.push(`불완전한 매핑: ${JSON.stringify(mapping)}`);
        }

        // 경로 형식 체크 (소문자, 하이픈만 허용)
        if (!/^[a-z-]+$/.test(mapping.path)) {
            errors.push(`잘못된 경로 형식: "${mapping.path}". 소문자와 하이픈만 사용 가능합니다.`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}
