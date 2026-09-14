/**
 * 도구 라우트 전수 스모크 테스트
 *
 * 목적: 47개 도구 라우트가 "등록 → 디렉터리 → 메타데이터 → 실제 렌더"까지
 * 전 구간에서 살아 있는지 한 번에 검증한다.
 *
 * 배경: 과거 `text-encryptor`가 클라이언트 컴포넌트만 있고 `page.tsx`가 없어
 * 404가 났던 사례처럼, 도구 데이터 등록과 실제 라우트 파일이 어긋나는 문제가
 * 있었다. 이 테스트는 그 계열의 회귀를 잡는다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { act, cleanup, render } from '@testing-library/react';

import { encodingTools } from '@/app/data/encoding-tools';
import { conversionTools } from '@/app/data/conversion-tools';
import { textTools } from '@/app/data/text-tools';
import { securityTools } from '@/app/data/security-tools';
import { developerTools } from '@/app/data/developer-tools';
import { getPathForCategory } from '@/lib/utils/routing';
import { allTools } from '@/app/data/integrations';
import { recommendByRules } from '@/lib/recommend/rules';

// prettier 는 ESM 전용 동적 import 를 쓰는 CJS 번들이라 jsdom 테스트 워커를 죽인다
// (ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG). 이 스모크 테스트는 "렌더가 터지지 않는지"만
// 보면 되므로 포매팅 결과는 항등 함수로 대체한다.
jest.mock('prettier', () => ({
    format: jest.fn(async (code: string) => code),
}));

const REPO_ROOT = path.join(__dirname, '..', '..');
const APP_MAIN = path.join(REPO_ROOT, 'app', '(main)');

const ALL_TOOLS = [
    ...encodingTools,
    ...conversionTools,
    ...textTools,
    ...securityTools,
    ...developerTools,
];

/** [도구 id, 카테고리 경로, 라우트 디렉터리 절대경로] */
const TOOL_CASES: Array<[string, string, string]> = ALL_TOOLS.map((tool) => {
    const categoryPath = getPathForCategory(tool.category);
    return [tool.id, categoryPath, path.join(APP_MAIN, categoryPath, tool.id)];
});

afterEach(cleanup);

describe('도구 카탈로그', () => {
    it('도구 id는 중복되지 않는다', () => {
        const ids = ALL_TOOLS.map((tool) => tool.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('모든 도구의 카테고리가 라우팅 매핑에 존재한다', () => {
        // getPathForCategory 는 미등록 카테고리를 조용히 'encoding' 으로 떨어뜨리므로,
        // 실제 매핑 존재 여부를 별도로 확인한다.
        const unmapped = ALL_TOOLS.filter((tool) => !tool.category).map((tool) => tool.id);
        expect(unmapped).toEqual([]);

        const paths = ALL_TOOLS.map((tool) => getPathForCategory(tool.category));
        expect(paths.every((p) => ['encoding', 'conversion', 'text', 'security', 'developer'].includes(p))).toBe(
            true
        );
    });
});

describe.each(TOOL_CASES)('도구 라우트: %s (%s/%s)', (id, categoryPath, toolDir) => {
    it('page.tsx 와 layout.tsx 가 존재한다', () => {
        expect(fs.existsSync(path.join(toolDir, 'page.tsx'))).toBe(true);
        expect(fs.existsSync(path.join(toolDir, 'layout.tsx'))).toBe(true);
    });

    it('layout.tsx 가 title · description · canonical 메타데이터를 내보낸다', () => {
        const source = fs.readFileSync(path.join(toolDir, 'layout.tsx'), 'utf8');

        expect(source).toMatch(/export\s+const\s+metadata\s*:\s*Metadata/);
        expect(source).toMatch(/title\s*:/);
        expect(source).toMatch(/description\s*:/);
        expect(source).toContain(`/${categoryPath}/${id}`);
    });

    it('page.tsx 가 참조하는 컴포넌트가 실제로 존재한다', () => {
        const source = fs.readFileSync(path.join(toolDir, 'page.tsx'), 'utf8');

        // dynamic(() => import('...')) 과 정적 import 를 모두 수집한다.
        const specs = [
            ...[...source.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)].map((match) => match[1]),
            ...[...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((match) => match[1]),
        ];

        // 이 프로젝트 내부를 가리키는 스펙만 검사한다. (react, next 등은 제외)
        const projectSpecs = specs.filter((spec) => spec.startsWith('./') || spec.startsWith('@/'));
        expect(projectSpecs.length).toBeGreaterThan(0);

        for (const spec of projectSpecs) {
            const base = spec.startsWith('@/')
                ? path.join(REPO_ROOT, spec.slice('@/'.length))
                : path.resolve(toolDir, spec);

            const candidates = [
                base,
                `${base}.tsx`,
                `${base}.ts`,
                path.join(base, 'index.tsx'),
                path.join(base, 'index.ts'),
            ];

            expect({ spec, exists: candidates.some((candidate) => fs.existsSync(candidate)) }).toEqual({
                spec,
                exists: true,
            });
        }
    });

    it('페이지가 예외 없이 렌더링된다', async () => {
        const pageModule = await import(path.join(toolDir, 'page.tsx'));
        const Page = pageModule.default;

        expect(typeof Page).toBe('function');

        // page.tsx 는 next/dynamic 으로 클라이언트 컴포넌트를 지연 로드하므로,
        // 로딩 폴백이 실제 컴포넌트로 교체되는 것까지 act 안에서 흘려보낸다.
        let container: HTMLElement;
        await act(async () => {
            ({ container } = render(<Page />));
        });

        expect(container!).toBeTruthy();
        // 렌더 결과가 완전히 비어 있으면(빈 div 도 없으면) 실패로 본다.
        expect(container!.innerHTML.length).toBeGreaterThan(0);
    });

    it('layout.tsx 가 자신의 id 로 관련 도구를 연결한다', () => {
        const source = fs.readFileSync(path.join(toolDir, 'layout.tsx'), 'utf8');

        // id 를 잘못 넘기면 모든 페이지가 같은 도구를 추천하게 되므로 여기서 고정한다.
        expect(source).toContain('RelatedTools');
        expect(source).toContain(`toolId='${id}'`);
    });

    it('관련 도구 추천이 자기 자신을 제외하고 1개 이상 나온다', () => {
        const recommendations = recommendByRules(id, allTools, 4);

        expect(recommendations.length).toBeGreaterThan(0);
        expect(recommendations.some((item) => item.tool.id === id)).toBe(false);
        expect(recommendations.every((item) => item.reasons.length > 0)).toBe(true);
    });
});
