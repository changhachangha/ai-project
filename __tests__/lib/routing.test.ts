import {
    CATEGORY_PATH_MAPPINGS,
    getPathForCategory,
    getCategoriesForPath,
    getAllCategories,
    validateRoutingConfig,
} from '@/lib/utils/routing';

describe('lib/utils/routing', () => {
    it('카테고리 이름으로 경로를 찾는다', () => {
        expect(getPathForCategory('베이스 인코딩')).toBe('encoding');
        expect(getPathForCategory('텍스트 처리')).toBe('text');
        expect(getPathForCategory('보안/암호화')).toBe('security');
        expect(getPathForCategory('개발자 도구')).toBe('developer');
    });

    it('미등록 카테고리는 encoding 으로 폴백한다', () => {
        expect(getPathForCategory('존재하지 않는 카테고리')).toBe('encoding');
    });

    it('경로로부터 카테고리 목록을 반환한다', () => {
        expect(getCategoriesForPath('conversion')).toEqual(['시간/날짜', '색상', '유틸리티']);
        expect(getCategoriesForPath('encoding')).toHaveLength(4);
    });

    it('getAllCategories 는 모든 매핑을 반환한다', () => {
        expect(getAllCategories()).toHaveLength(CATEGORY_PATH_MAPPINGS.length);
    });

    it('validateRoutingConfig 는 현재 설정을 유효하다고 판정한다', () => {
        const result = validateRoutingConfig();
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
    });

    it('모든 매핑의 경로는 소문자/하이픈 형식이다', () => {
        CATEGORY_PATH_MAPPINGS.forEach((mapping) => {
            expect(mapping.path).toMatch(/^[a-z-]+$/);
            expect(mapping.description.length).toBeGreaterThan(0);
        });
    });
});
