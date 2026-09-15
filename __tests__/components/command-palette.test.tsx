/**
 * CommandPalette 회귀 테스트
 *
 * 배경: 이 컴포넌트는 한동안 하드코딩된 더미 목록(7개, 일부 영어)을 쓰면서
 * `/(main)/tools/{id}` 같은 존재하지 않는 경로로 이동시켜, 어떤 항목을 골라도
 * 404가 났다. 목록과 경로가 실제 도구 데이터에서 나오는지 고정한다.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CommandPalette from '@/components/command-palette/CommandPalette';
import { allTools } from '@/app/data/integrations';
import { toolPath } from '@/lib/utils/paths';

const push = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}));

beforeEach(() => {
    push.mockClear();
});

const renderPalette = (isOpen = true) => render(<CommandPalette isOpen={isOpen} onClose={jest.fn()} />);

describe('CommandPalette', () => {
    it('실제 도구 목록을 보여준다', () => {
        renderPalette();

        // 등록된 도구 중 첫 번째 항목이 검색 창에 나타나야 한다.
        expect(screen.getByText(allTools[0].name)).toBeInTheDocument();
    });

    it('검색어로 목록을 좁힌다', async () => {
        const user = userEvent.setup();
        renderPalette();

        const target = allTools.find((tool) => tool.id === 'case-converter');
        expect(target).toBeDefined();

        await user.type(screen.getByPlaceholderText('도구 검색...'), '케이스');

        expect(screen.getByText(target!.name)).toBeInTheDocument();
    });

    it('검색 결과가 없으면 안내 문구를 보여준다', async () => {
        const user = userEvent.setup();
        renderPalette();

        await user.type(screen.getByPlaceholderText('도구 검색...'), 'zzzz-no-such-tool');

        expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it('도구를 고르면 카테고리 경로로 이동한다', async () => {
        const user = userEvent.setup();
        renderPalette();

        const target = allTools.find((tool) => tool.id === 'case-converter')!;
        await user.click(screen.getByText(target.name));

        // `/(main)/tools/...` 같은 라우트 그룹 경로가 아니라 실제 URL 이어야 한다.
        expect(push).toHaveBeenCalledWith(toolPath(target));
        expect(push).toHaveBeenCalledWith('/text/case-converter');
    });

    it('모든 도구가 실제 존재하는 경로로 이동한다', async () => {
        // 하드코딩된 목록이 다시 들어오면 이 검사가 먼저 깨진다.
        const paths = allTools.map((tool) => toolPath(tool));

        expect(paths.every((path) => !path.includes('(main)'))).toBe(true);
        expect(paths.every((path) => !path.startsWith('/tools/'))).toBe(true);
        expect(new Set(paths).size).toBe(paths.length);
    });
});
