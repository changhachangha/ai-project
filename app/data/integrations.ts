import { encodingTools } from './encoding-tools';
import { textTools } from './text-tools';
import { securityTools } from './security-tools';
import type { Integration } from './types';

// 모든 도구들을 합칩니다.
export const allTools: Integration[] = [
  ...encodingTools,
  ...textTools,
  ...securityTools,
];

// 모든 도구들을 카테고리별로 그룹화합니다.
export const groupedTools = allTools.reduce((acc, tool) => {
    // 현재 도구의 카테고리를 찾습니다.
    let group = acc.find((g) => g.category === tool.category);

    // 그룹이 없으면 새로 생성합니다.
    if (!group) {
        group = { category: tool.category, tools: [] };
        acc.push(group);
    }

    // 현재 그룹에 도구를 추가합니다.
    group.tools.push(tool);

    return acc;
}, [] as { category: string; tools: Integration[] }[]);

// 모든 카테고리 목록을 생성합니다.
export const allCategories: string[] = ['All', ...groupedTools.map((g) => g.category)];
