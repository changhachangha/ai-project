import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '@/components/theme-toggle';

// Mock next-themes
const mockSetTheme = jest.fn();
jest.mock('next-themes', () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    useTheme: () => ({
        theme: 'light',
        setTheme: mockSetTheme,
    }),
}));

describe('ThemeToggle', () => {
    beforeEach(() => {
        mockSetTheme.mockClear();
    });

    it('테마 토글 버튼이 렌더링됨', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('테마 전환')).toBeInTheDocument();
    });

    it('버튼 클릭 시 테마가 전환됨', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('Sun과 Moon 아이콘이 모두 존재함', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        // SVG 요소들이 존재하는지 확인 (aria-hidden이므로 다른 방법 사용)
        const button = screen.getByRole('button');
        const svgElements = button.querySelectorAll('svg');
        expect(svgElements).toHaveLength(2); // Sun과 Moon 아이콘
    });
});
