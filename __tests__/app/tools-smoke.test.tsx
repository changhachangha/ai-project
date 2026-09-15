/**
 * 도구 라우트 전수 스모크 테스트
 *
 * 목적: 47개 도구가 "데이터 등록 → 레지스트리 → 실제 렌더"까지 전 구간에서
 * 살아 있는지 한 번에 검증한다.
 *
 * 배경: 과거 `text-encryptor`가 클라이언트 컴포넌트만 있고 `page.tsx`가 없어
 * 404가 났던 사례가 있었다. 라우트가 [section]/[tool] 동적 라우트 + 레지스트리로
 * 합쳐진 지금은 "레지스트리에 엔트리가 있는가"가 그 계열 회귀를 잡는 검사다.
 */
import { act, cleanup, render } from '@testing-library/react';

import { encodingTools } from '@/app/data/encoding-tools';
import { conversionTools } from '@/app/data/conversion-tools';
import { textTools } from '@/app/data/text-tools';
import { securityTools } from '@/app/data/security-tools';
import { developerTools } from '@/app/data/developer-tools';
import { TOOL_SECTIONS } from '@/app/data/types';
import { allTools } from '@/app/data/integrations';
import { recommend } from '@/lib/recommend';
import { toolPath } from '@/lib/utils/paths';
import ToolHost, { getToolComponent } from '@/components/tools/tool-host';
import { generateStaticParams } from '@/app/(main)/[section]/[tool]/page';

// prettier 는 ESM 전용 동적 import 를 쓰는 CJS 번들이라 jsdom 테스트 워커를 죽인다
// (ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG). 이 스모크 테스트는 "렌더가 터지지 않는지"만
// 보면 되므로 포매팅 결과는 항등 함수로 대체한다.
jest.mock('prettier', () => ({
    format: jest.fn(async (code: string) => code),
}));

const ALL_TOOLS = [
    ...encodingTools,
    ...conversionTools,
    ...textTools,
    ...securityTools,
    ...developerTools,
];

/** [도구 id, 섹션, URL 경로] */
const TOOL_CASES: Array<[string, string, string]> = ALL_TOOLS.map((tool) => [
    tool.id,
    tool.section,
    toolPath(tool),
]);

afterEach(cleanup);

describe('도구 카탈로그', () => {
    it('도구 id는 중복되지 않는다', () => {
        const ids = ALL_TOOLS.map((tool) => tool.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('모든 도구의 section 이 유효한 섹션이다', () => {
        // 라우팅은 section 필드가 직접 담당한다. 유효하지 않은 section 은
        // 타입 단계에서 이미 걸러지지만, 데이터 파일 편집 실수를 한 번 더 잡는다.
        const invalid = ALL_TOOLS.filter((tool) => !TOOL_SECTIONS.includes(tool.section)).map(
            (tool) => tool.id
        );
        expect(invalid).toEqual([]);
    });

    it('같은 데이터 파일의 도구는 같은 section 을 갖는다', () => {
        // 파일↔섹션 1:1 조직 규칙. 어기면 카탈로그 표시와 URL 이 어긋난다.
        const fileSections: Array<[string, typeof encodingTools, string]> = [
            ['encoding-tools.ts', encodingTools, 'encoding'],
            ['conversion-tools.ts', conversionTools, 'conversion'],
            ['text-tools.ts', textTools, 'text'],
            ['security-tools.ts', securityTools, 'security'],
            ['developer-tools.ts', developerTools, 'developer'],
        ];

        for (const [file, tools, section] of fileSections) {
            const wrong = tools.filter((tool) => tool.section !== section).map((tool) => tool.id);
            expect({ file, wrong }).toEqual({ file, wrong: [] });
        }
    });

    it('generateStaticParams 가 전체 도구의 section/tool 조합을 만든다', () => {
        const params = generateStaticParams();
        const expected = ALL_TOOLS.map((tool) => ({ section: tool.section, tool: tool.id }));

        expect(params).toHaveLength(ALL_TOOLS.length);
        expect(params).toEqual(expect.arrayContaining(expected));
    });
});

describe.each(TOOL_CASES)('도구 라우트: %s (%s)', (id, _section, urlPath) => {
    it('레지스트리에 렌더링 컴포넌트가 등록되어 있다', () => {
        // 동적 라우트는 레지스트리 누락이 곧 404 다.
        expect(getToolComponent(id)).toBeDefined();
    });

    it('URL 경로가 /section/id 형식이다', () => {
        const tool = ALL_TOOLS.find((item) => item.id === id)!;
        expect(urlPath).toBe(`/${tool.section}/${id}`);
    });

    it('ToolHost 를 통해 예외 없이 렌더링된다', async () => {
        // 레지스트리 → dynamic import → 실제 컴포넌트까지 흘려보낸다.
        // 이전 page.tsx 셸을 거치던 검사를 공개 경로로 옮긴 것이다.
        let container: HTMLElement;
        await act(async () => {
            ({ container } = render(<ToolHost toolId={id} />));
        });

        expect(container!).toBeTruthy();
        // 렌더 결과가 완전히 비어 있으면(빈 div 도 없으면) 실패로 본다.
        expect(container!.innerHTML.length).toBeGreaterThan(0);
    });

    it('관련 도구 추천이 자기 자신을 제외하고 1개 이상 나온다', () => {
        const recommendations = recommend(id, allTools, 4);

        expect(recommendations.length).toBeGreaterThan(0);
        expect(recommendations.some((item) => item.tool.id === id)).toBe(false);
        expect(recommendations.every((item) => item.reasons.length > 0)).toBe(true);
    });
});
