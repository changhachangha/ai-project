import { encodingTools } from './encoding-tools';
import type { Integration } from './types';

// 기존의 평평한 배열을 카테고리별로 그룹화된 배열로 변경합니다.
const groupedTools = encodingTools.reduce(
  (acc, tool) => {
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
  },
  [] as { category: string; tools: Integration[] }
);

// 외부에서 사용할 데이터들을 export 합니다.
export { groupedTools };
export const allTools: Integration[] = [...encodingTools];
export const allCategories: string[] = [
  'All',
  ...groupedTools.map((g) => g.category),
];
