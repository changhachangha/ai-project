import { NextResponse } from 'next/server';
import { allTools, groupedTools } from '@/app/data/integrations';
import { toolPath } from '@/lib/utils/paths';

// 정적 데이터만 반환하므로 빌드 시점에 정적화한다.
export const dynamic = 'force-static';

/**
 * GET /api/tools
 *
 * 전체 도구 카탈로그를 JSON 으로 반환한다.
 * - 사이트맵/외부 연동/문서 자동 생성 등에 사용할 수 있다.
 */
export function GET() {
    return NextResponse.json({
        total: allTools.length,
        categories: groupedTools.map((group) => ({
            category: group.category,
            path: group.tools[0].section,
            count: group.tools.length,
        })),
        tools: allTools.map((tool) => ({
            id: tool.id,
            name: tool.name,
            description: tool.description,
            category: tool.category,
            path: toolPath(tool),
        })),
    });
}
