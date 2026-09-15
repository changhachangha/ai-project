/**
 * @jest-environment node
 */
import { GET } from '@/app/api/tools/route';
import { allTools } from '@/app/data/integrations';
import { toolPath } from '@/lib/utils/paths';

describe('GET /api/tools', () => {
    it('200 과 함께 전체 도구 목록을 반환한다', async () => {
        const response = GET();
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.total).toBe(allTools.length);
        expect(body.tools).toHaveLength(allTools.length);
    });

    it('각 도구는 id/name/description/category/path 를 갖는다', async () => {
        const body = await GET().json();

        body.tools.forEach((tool: Record<string, string>) => {
            expect(typeof tool.id).toBe('string');
            expect(tool.name.length).toBeGreaterThan(0);
            expect(tool.description.length).toBeGreaterThan(0);
            const source = allTools.find((item) => item.id === tool.id)!;
            expect(tool.path).toBe(toolPath(source));
        });
    });

    it('React 아이콘 컴포넌트는 응답에 포함되지 않는다', async () => {
        const body = await GET().json();
        expect(body.tools.every((tool: Record<string, unknown>) => !('icon' in tool))).toBe(true);
    });

    it('카테고리 요약의 count 합계가 전체 도구 수와 일치한다', async () => {
        const body = await GET().json();
        const sum = body.categories.reduce(
            (acc: number, category: { count: number }) => acc + category.count,
            0
        );
        expect(sum).toBe(allTools.length);
        expect(body.categories.every((c: { path: string }) => typeof c.path === 'string')).toBe(true);
    });
});
