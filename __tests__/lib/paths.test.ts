import { toolPath } from '@/lib/utils/paths';
import { allTools } from '@/app/data/integrations';
import { TOOL_SECTIONS } from '@/app/data/types';

describe('lib/utils/paths', () => {
    it('section + id 로 경로를 만든다', () => {
        expect(toolPath({ id: 'base64', section: 'encoding' })).toBe('/encoding/base64');
        expect(toolPath({ id: 'json-formatter', section: 'text' })).toBe('/text/json-formatter');
    });

    it('전체 도구의 경로가 유효한 섹션 아래에 있다', () => {
        for (const tool of allTools) {
            const path = toolPath(tool);
            expect(path).toBe(`/${tool.section}/${tool.id}`);
            expect(TOOL_SECTIONS).toContain(tool.section);
        }
    });

    it('모든 도구 경로가 고유하다', () => {
        const paths = allTools.map((tool) => toolPath(tool));
        expect(new Set(paths).size).toBe(paths.length);
    });
});
