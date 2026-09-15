import type { Integration } from '@/app/data/types';

/**
 * 도구 하나의 URL 경로.
 *
 * 과거에는 category 문자열을 매핑 테이블로 변환해 경로를 만들었는데,
 * 매핑에 없는 카테고리가 조용히 'encoding' 으로 떨어지는 문제가 있었다.
 * 이제 라우팅은 데이터의 section 필드가 직접 담당하므로 경로는 파생일 뿐이다.
 * 빌드(sitemap)·서버(api)·클라이언트(router.push) 공용.
 */
export const toolPath = (tool: Pick<Integration, 'id' | 'section'>): string =>
    `/${tool.section}/${tool.id}`;
